// @vitest-environment node
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { IPC, type LastSync, type SyncResult } from '../../src/shared/ipc'
import { registerIpc } from '../../src/main/ipc'
import {
  DEFAULT_CACHE_URL,
  loadBearNotes,
  loadFileNotes,
  readState,
  scanBear,
  scanMarkdown,
  syncNotes,
  updateState,
  type AppState,
  type LoadedNotes,
} from '@md-viz/sync'

const electron = vi.hoisted(() => ({
  handle: vi.fn<(channel: string, listener: unknown) => void>(),
  fromWebContents: vi.fn(),
  showOpenDialog: vi.fn(),
}))
vi.mock('electron', () => ({
  app: { getPath: () => '/user-data' },
  BrowserWindow: { fromWebContents: electron.fromWebContents },
  dialog: { showOpenDialog: electron.showOpenDialog },
  ipcMain: { handle: electron.handle },
}))
vi.mock('@md-viz/sync', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/sync')>()),
  DEFAULT_CACHE_URL: 'http://default.test',
  scanMarkdown: vi.fn(),
  scanBear: vi.fn(),
  loadBearNotes: vi.fn(),
  loadFileNotes: vi.fn(),
  readState: vi.fn(),
  updateState: vi.fn(),
  syncNotes: vi.fn(),
}))

type Handler = (event: unknown, ...args: unknown[]) => Promise<unknown>

function handler(channel: string): Handler {
  const call = electron.handle.mock.calls.find(([name]) => name === channel)
  return call![1] as Handler
}

const sender = (destroyed = false) => ({ isDestroyed: () => destroyed, send: vi.fn() })
const stateFile = path.join('/user-data', 'state.json')

const emptyState = (): AppState => ({ lastSource: 'file', lastFolder: null, syncs: {} })

const syncResult: SyncResult = {
  scanned: 1,
  synced: 1,
  unchanged: 0,
  deleted: 0,
  failed: 0,
  notes: { updated: [{ id: 'a', title: 'a' }], deleted: [], unchanged: [] },
}

/** runs the change `updateState` was last given on a fresh state. */
function appliedChange(): AppState {
  const change = vi.mocked(updateState).mock.calls.at(-1)!
  expect(change[0]).toBe(stateFile)
  const state = emptyState()
  change[1](state)
  return state
}

describe('registerIpc', () => {
  let folder: string

  beforeEach(async () => {
    folder = await mkdtemp(path.join(tmpdir(), 'md-viz-ipc-'))
    registerIpc()
  })

  afterEach(async () => {
    vi.clearAllMocks()
    delete process.env['CACHE_URL']
    await rm(folder, { recursive: true, force: true })
  })

  it('registers a handler for every channel except the progress ones', () => {
    const channels = electron.handle.mock.calls.map(([name]) => name)

    expect(channels.sort()).toEqual(
      [IPC.pickFolder, IPC.scan, IPC.sync, IPC.selectSource, IPC.loadLast].sort(),
    )
  })

  describe('pickFolder', () => {
    it('opens the dialog on the window that asked and remembers the pick as the file folder', async () => {
      const window = {}
      electron.fromWebContents.mockReturnValue(window)
      electron.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/notes'] })

      const picked = await handler(IPC.pickFolder)({ sender: {} })

      expect(picked).toBe('/notes')
      expect(electron.showOpenDialog).toHaveBeenCalledWith(window, {
        properties: ['openDirectory'],
      })
      expect(appliedChange()).toMatchObject({ lastSource: 'file', lastFolder: '/notes' })
    })

    it('opens a window-less dialog when the sender has no window', async () => {
      electron.fromWebContents.mockReturnValue(null)
      electron.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/notes'] })

      await handler(IPC.pickFolder)({ sender: {} })

      expect(electron.showOpenDialog).toHaveBeenCalledWith({ properties: ['openDirectory'] })
    })

    it.each([
      ['cancelled', { canceled: true, filePaths: ['/notes'] }],
      ['empty', { canceled: false, filePaths: [] }],
    ])('returns null and remembers nothing when the dialog is %s', async (_, result) => {
      electron.showOpenDialog.mockResolvedValue(result)

      expect(await handler(IPC.pickFolder)({ sender: {} })).toBeNull()
      expect(updateState).not.toHaveBeenCalled()
    })
  })

  describe('scan', () => {
    it('scans a folder and forwards progress to the sender', async () => {
      const webContents = sender()
      vi.mocked(scanMarkdown).mockImplementation((_, onProgress) => {
        onProgress?.({ dirs: 1, mdFiles: 2 })
        return Promise.resolve({ count: 2 })
      })

      const result = await handler(IPC.scan)({ sender: webContents }, { source: 'file', folder })

      expect(result).toEqual({ count: 2 })
      expect(scanMarkdown).toHaveBeenCalledWith(folder, expect.any(Function))
      expect(webContents.send).toHaveBeenCalledWith(IPC.scanProgress, { dirs: 1, mdFiles: 2 })
    })

    it('does not send progress to a destroyed sender', async () => {
      const webContents = sender(true)
      vi.mocked(scanMarkdown).mockImplementation((_, onProgress) => {
        onProgress?.({ dirs: 1, mdFiles: 2 })
        return Promise.resolve({ count: 2 })
      })

      await handler(IPC.scan)({ sender: webContents }, { source: 'file', folder })

      expect(webContents.send).not.toHaveBeenCalled()
    })

    it('counts the Bear notes without a folder', async () => {
      vi.mocked(scanBear).mockResolvedValue({ count: 7 })

      expect(await handler(IPC.scan)({ sender: sender() }, { source: 'bear' })).toEqual({
        count: 7,
      })
      expect(scanMarkdown).not.toHaveBeenCalled()
    })

    it.each([
      ['no target', undefined, 'expected a source'],
      ['an unknown source', { source: 'notion' }, 'expected a source'],
      ['a file source without a folder', { source: 'file' }, 'expected an absolute folder path'],
      [
        'a relative folder',
        { source: 'file', folder: 'notes' },
        'expected an absolute folder path',
      ],
    ])('rejects %s', async (_, target, message) => {
      await expect(handler(IPC.scan)({ sender: sender() }, target)).rejects.toThrow(message)
      expect(scanMarkdown).not.toHaveBeenCalled()
    })

    it('rejects a path that is a file', async () => {
      const file = path.join(folder, 'a.md')
      await writeFile(file, '')

      await expect(
        handler(IPC.scan)({ sender: sender() }, { source: 'file', folder: file }),
      ).rejects.toThrow('not a directory')
    })
  })

  describe('sync', () => {
    const loaded: LoadedNotes = { notes: [], failed: [] }

    beforeEach(() => {
      vi.mocked(loadFileNotes).mockResolvedValue(loaded)
      vi.mocked(loadBearNotes).mockResolvedValue(loaded)
    })

    it('syncs a folder to the default cache, forwards progress and records the sync', async () => {
      const webContents = sender()
      vi.mocked(syncNotes).mockImplementation((_s, _l, options) => {
        options?.onProgress?.({ synced: 1, deleted: 0, total: 1 })
        return Promise.resolve(syncResult)
      })

      expect(await handler(IPC.sync)({ sender: webContents }, { source: 'file', folder })).toBe(
        syncResult,
      )

      expect(loadFileNotes).toHaveBeenCalledWith(folder)
      expect(syncNotes).toHaveBeenCalledWith(
        'file',
        loaded,
        expect.objectContaining({ baseUrl: DEFAULT_CACHE_URL }),
      )
      expect(webContents.send).toHaveBeenCalledWith(IPC.syncProgress, {
        synced: 1,
        deleted: 0,
        total: 1,
      })
      const state = appliedChange()
      expect(state.lastSource).toBe('file')
      expect(state.lastFolder).toBe(folder)
      expect(state.syncs[`file:${folder}`]?.notes).toBe(syncResult.notes)
      expect(Date.parse(state.syncs[`file:${folder}`]?.syncedAt ?? '')).not.toBeNaN()
    })

    it('syncs Bear without a folder and records it under its own key', async () => {
      vi.mocked(syncNotes).mockResolvedValue(syncResult)

      await handler(IPC.sync)({ sender: sender() }, { source: 'bear' })

      expect(loadBearNotes).toHaveBeenCalled()
      expect(loadFileNotes).not.toHaveBeenCalled()
      expect(syncNotes).toHaveBeenCalledWith('bear', loaded, expect.anything())
      const state = appliedChange()
      expect(state.lastSource).toBe('bear')
      expect(state.lastFolder).toBeNull()
      expect(state.syncs['bear']?.notes).toBe(syncResult.notes)
    })

    it('syncs to the cache named by CACHE_URL', async () => {
      process.env['CACHE_URL'] = 'http://cache.test'
      vi.mocked(syncNotes).mockResolvedValue(syncResult)

      await handler(IPC.sync)({ sender: sender() }, { source: 'file', folder })

      expect(syncNotes).toHaveBeenCalledWith(
        'file',
        loaded,
        expect.objectContaining({ baseUrl: 'http://cache.test' }),
      )
    })

    it('does not send progress to a destroyed sender', async () => {
      const webContents = sender(true)
      vi.mocked(syncNotes).mockImplementation((_s, _l, options) => {
        options?.onProgress?.({ synced: 1, deleted: 0, total: 1 })
        return Promise.resolve(syncResult)
      })

      await handler(IPC.sync)({ sender: webContents }, { source: 'file', folder })

      expect(webContents.send).not.toHaveBeenCalled()
    })

    it('rejects a target that is not valid before loading anything', async () => {
      await expect(
        handler(IPC.sync)({ sender: sender() }, { source: 'file', folder: 'relative' }),
      ).rejects.toThrow('expected an absolute folder path')
      expect(loadFileNotes).not.toHaveBeenCalled()
      expect(syncNotes).not.toHaveBeenCalled()
    })

    it('records nothing when loading fails', async () => {
      vi.mocked(loadBearNotes).mockRejectedValue(new Error('bear is not installed'))

      await expect(handler(IPC.sync)({ sender: sender() }, { source: 'bear' })).rejects.toThrow(
        'bear is not installed',
      )
      expect(updateState).not.toHaveBeenCalled()
    })
  })

  describe('selectSource and loadLast', () => {
    const lastSync: LastSync = {
      syncedAt: '2026-10-20T09:30:00.000Z',
      notes: { updated: [], deleted: [], unchanged: [] },
    }

    it('selectSource remembers the source and returns the Bear sync', async () => {
      vi.mocked(readState).mockResolvedValue({
        ...emptyState(),
        lastSource: 'bear',
        syncs: { bear: lastSync },
      })

      expect(await handler(IPC.selectSource)({}, 'bear')).toEqual({
        source: 'bear',
        folder: null,
        lastSync,
      })
      expect(appliedChange().lastSource).toBe('bear')
    })

    it('selectSource returns the saved folder with its sync when switching back to files', async () => {
      vi.mocked(readState).mockResolvedValue({
        lastSource: 'file',
        lastFolder: folder,
        syncs: { [`file:${folder}`]: lastSync },
      })

      expect(await handler(IPC.selectSource)({}, 'file')).toEqual({
        source: 'file',
        folder,
        lastSync,
      })
    })

    it('selectSource rejects an unknown source', async () => {
      await expect(handler(IPC.selectSource)({}, 'notion')).rejects.toThrow('expected a source')
      expect(updateState).not.toHaveBeenCalled()
    })

    it('loadLast returns the saved source and folder with its last sync', async () => {
      vi.mocked(readState).mockResolvedValue({
        lastSource: 'file',
        lastFolder: folder,
        syncs: { [`file:${folder}`]: lastSync },
      })

      expect(await handler(IPC.loadLast)({})).toEqual({ source: 'file', folder, lastSync })
      expect(readState).toHaveBeenCalledWith(stateFile)
    })

    it('loadLast returns the saved folder with no sync when it was never synced', async () => {
      vi.mocked(readState).mockResolvedValue({ ...emptyState(), lastFolder: folder })

      expect(await handler(IPC.loadLast)({})).toEqual({
        source: 'file',
        folder,
        lastSync: null,
      })
    })

    it.each([
      ['no folder was saved', null],
      ['the saved folder is gone', 'missing'],
    ])('loadLast returns no folder when %s', async (_, saved) => {
      vi.mocked(readState).mockResolvedValue({
        ...emptyState(),
        lastFolder: saved && path.join(folder, saved),
        syncs: { 'file:x': lastSync },
      })

      expect(await handler(IPC.loadLast)({})).toEqual({
        source: 'file',
        folder: null,
        lastSync: null,
      })
    })

    it('loadLast returns Bear when it was the last source', async () => {
      vi.mocked(readState).mockResolvedValue({ ...emptyState(), lastSource: 'bear' })

      expect(await handler(IPC.loadLast)({})).toEqual({
        source: 'bear',
        folder: null,
        lastSync: null,
      })
    })
  })
})
