// @vitest-environment node
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { IPC, type SyncResult } from '../../src/shared/ipc'
import type { AppState } from '../../src/main/state'
import { registerIpc } from '../../src/main/ipc'
import { loadFileNotes, type LoadedNotes } from '../../src/main/load-file-notes'
import { scanMarkdown } from '../../src/main/scan'
import { readState, updateState } from '../../src/main/state'
import { DEFAULT_CACHE_URL, syncNotes } from '../../src/main/sync'

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
vi.mock('../../src/main/scan', () => ({ scanMarkdown: vi.fn() }))
vi.mock('../../src/main/state', () => ({ readState: vi.fn(), updateState: vi.fn() }))
vi.mock('../../src/main/sync', () => ({
  DEFAULT_CACHE_URL: 'http://default.test',
  syncNotes: vi.fn(),
}))
vi.mock('../../src/main/load-file-notes', () => ({ loadFileNotes: vi.fn() }))

type Handler = (event: unknown, ...args: unknown[]) => Promise<unknown>

function handler(channel: string): Handler {
  const call = electron.handle.mock.calls.find(([name]) => name === channel)
  return call![1] as Handler
}

const sender = (destroyed = false) => ({ isDestroyed: () => destroyed, send: vi.fn() })
const stateFile = path.join('/user-data', 'state.json')

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
      [IPC.pickFolder, IPC.scanFolder, IPC.syncFolder, IPC.loadLast].sort(),
    )
  })

  describe('pickFolder', () => {
    it('opens the dialog on the window that asked and remembers the pick', async () => {
      const window = {}
      electron.fromWebContents.mockReturnValue(window)
      electron.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/notes'] })

      const picked = await handler(IPC.pickFolder)({ sender: {} })

      expect(picked).toBe('/notes')
      expect(electron.showOpenDialog).toHaveBeenCalledWith(window, {
        properties: ['openDirectory'],
      })
      const change = vi.mocked(updateState).mock.calls[0]
      expect(change[0]).toBe(stateFile)
      const state: AppState = { lastFolder: null, syncs: {} }
      change[1](state)
      expect(state.lastFolder).toBe('/notes')
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

  describe('scanFolder', () => {
    it('scans the folder and forwards progress to the sender', async () => {
      const webContents = sender()
      vi.mocked(scanMarkdown).mockImplementation((_, onProgress) => {
        onProgress?.({ dirs: 1, mdFiles: 2 })
        return Promise.resolve({ mdCount: 2 })
      })

      const result = await handler(IPC.scanFolder)({ sender: webContents }, folder)

      expect(result).toEqual({ mdCount: 2 })
      expect(webContents.send).toHaveBeenCalledWith(IPC.scanProgress, { dirs: 1, mdFiles: 2 })
    })

    it('does not send progress to a destroyed sender', async () => {
      const webContents = sender(true)
      vi.mocked(scanMarkdown).mockImplementation((_, onProgress) => {
        onProgress?.({ dirs: 1, mdFiles: 2 })
        return Promise.resolve({ mdCount: 2 })
      })

      await handler(IPC.scanFolder)({ sender: webContents }, folder)

      expect(webContents.send).not.toHaveBeenCalled()
    })

    it.each([
      ['not a string', 42, 'expected an absolute folder path'],
      ['relative', 'notes', 'expected an absolute folder path'],
    ])('rejects a folder that is %s', async (_, value, message) => {
      await expect(handler(IPC.scanFolder)({ sender: sender() }, value)).rejects.toThrow(message)
      expect(scanMarkdown).not.toHaveBeenCalled()
    })

    it('rejects a path that is a file', async () => {
      const file = path.join(folder, 'a.md')
      await writeFile(file, '')

      await expect(handler(IPC.scanFolder)({ sender: sender() }, file)).rejects.toThrow(
        'not a directory',
      )
    })
  })

  describe('syncFolder', () => {
    const result: SyncResult = {
      scanned: 1,
      synced: 1,
      unchanged: 0,
      deleted: 0,
      failed: 0,
      notes: { updated: [{ id: 'a', title: 'a' }], deleted: [], unchanged: [] },
    }

    const loaded: LoadedNotes = { notes: [], failed: [] }

    beforeEach(() => {
      vi.mocked(loadFileNotes).mockResolvedValue(loaded)
    })

    it('syncs to the default cache, forwards progress and records the sync', async () => {
      const webContents = sender()
      vi.mocked(syncNotes).mockImplementation((_s, _l, options) => {
        options?.onProgress?.({ synced: 1, deleted: 0, total: 1 })
        return Promise.resolve(result)
      })

      expect(await handler(IPC.syncFolder)({ sender: webContents }, folder)).toBe(result)

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
      const change = vi.mocked(updateState).mock.calls[0]
      expect(change[0]).toBe(stateFile)
      const state: AppState = { lastFolder: null, syncs: {} }
      change[1](state)
      expect(state.lastFolder).toBe(folder)
      expect(state.syncs[folder].notes).toBe(result.notes)
      expect(Date.parse(state.syncs[folder].syncedAt)).not.toBeNaN()
    })

    it('syncs to the cache named by CACHE_URL', async () => {
      process.env['CACHE_URL'] = 'http://cache.test'
      vi.mocked(syncNotes).mockResolvedValue(result)

      await handler(IPC.syncFolder)({ sender: sender() }, folder)

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
        return Promise.resolve(result)
      })

      await handler(IPC.syncFolder)({ sender: webContents }, folder)

      expect(webContents.send).not.toHaveBeenCalled()
    })

    it('rejects a folder that is not a directory path', async () => {
      await expect(handler(IPC.syncFolder)({ sender: sender() }, 'relative')).rejects.toThrow(
        'expected an absolute folder path',
      )
      expect(syncNotes).not.toHaveBeenCalled()
    })
  })

  describe('loadLast', () => {
    const lastSync = { syncedAt: '2026-10-20T09:30:00.000Z', notes: result() }

    function result() {
      return { updated: [], deleted: [], unchanged: [] }
    }

    it('returns null when no folder was saved', async () => {
      vi.mocked(readState).mockResolvedValue({ lastFolder: null, syncs: {} })

      expect(await handler(IPC.loadLast)({})).toBeNull()
    })

    it('returns null when the saved folder is gone', async () => {
      vi.mocked(readState).mockResolvedValue({
        lastFolder: path.join(folder, 'missing'),
        syncs: {},
      })

      expect(await handler(IPC.loadLast)({})).toBeNull()
    })

    it('returns the saved folder with its last sync', async () => {
      vi.mocked(readState).mockResolvedValue({ lastFolder: folder, syncs: { [folder]: lastSync } })

      expect(await handler(IPC.loadLast)({})).toEqual({ folder, lastSync })
      expect(readState).toHaveBeenCalledWith(stateFile)
    })

    it('returns the saved folder with no sync when it was never synced', async () => {
      vi.mocked(readState).mockResolvedValue({ lastFolder: folder, syncs: {} })

      expect(await handler(IPC.loadLast)({})).toEqual({ folder, lastSync: null })
    })
  })
})
