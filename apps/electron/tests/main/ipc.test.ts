// @vitest-environment node
import path from 'node:path'
import {
  loadLastSelection,
  rememberFolder,
  scanTarget,
  selectSource,
  syncTarget,
  type LastSelection,
  type SyncResult,
} from '@md-viz/sync'
import { IPC } from '../../src/shared/ipc'
import { registerIpc } from '../../src/main/ipc'

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
vi.mock('@md-viz/sync', () => ({
  DEFAULT_CACHE_URL: 'http://default.test',
  loadLastSelection: vi.fn(),
  rememberFolder: vi.fn(),
  scanTarget: vi.fn(),
  selectSource: vi.fn(),
  syncTarget: vi.fn(),
}))

type Handler = (event: unknown, ...args: unknown[]) => Promise<unknown>

function handler(channel: string): Handler {
  const call = electron.handle.mock.calls.find(([name]) => name === channel)
  return call![1] as Handler
}

const sender = (destroyed = false) => ({ isDestroyed: () => destroyed, send: vi.fn() })
const stateFile = path.join('/user-data', 'state.json')

const syncResult: SyncResult = {
  scanned: 1,
  synced: 1,
  unchanged: 0,
  deleted: 0,
  failed: 0,
  notes: { updated: [{ id: 'a', title: 'a', tags: [] }], deleted: [], unchanged: [] },
  tagColors: {},
}

const selection: LastSelection = { source: 'bear', folder: null, lastSync: null }

describe('registerIpc', () => {
  beforeEach(() => {
    registerIpc()
  })

  afterEach(() => {
    vi.clearAllMocks()
    delete process.env['CACHE_URL']
  })

  it('registers a handler for every channel except the progress ones', () => {
    const channels = electron.handle.mock.calls.map(([name]) => name)

    expect(channels.sort()).toEqual(
      [IPC.pickFolder, IPC.scan, IPC.sync, IPC.selectSource, IPC.loadLast].sort(),
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
      expect(rememberFolder).toHaveBeenCalledWith(stateFile, '/notes')
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
      expect(rememberFolder).not.toHaveBeenCalled()
    })
  })

  describe('scan', () => {
    const input = { source: 'file', folder: '/notes' }

    it('scans the target the renderer sent and forwards progress to the sender', async () => {
      const webContents = sender()
      vi.mocked(scanTarget).mockImplementation((_, onProgress) => {
        onProgress?.({ dirs: 1, mdFiles: 2 })
        return Promise.resolve({ count: 2 })
      })

      expect(await handler(IPC.scan)({ sender: webContents }, input)).toEqual({ count: 2 })
      expect(scanTarget).toHaveBeenCalledWith(input, expect.any(Function))
      expect(webContents.send).toHaveBeenCalledWith(IPC.scanProgress, { dirs: 1, mdFiles: 2 })
    })

    it('does not send progress to a destroyed sender', async () => {
      const webContents = sender(true)
      vi.mocked(scanTarget).mockImplementation((_, onProgress) => {
        onProgress?.({ dirs: 1, mdFiles: 2 })
        return Promise.resolve({ count: 2 })
      })

      await handler(IPC.scan)({ sender: webContents }, input)

      expect(webContents.send).not.toHaveBeenCalled()
    })
  })

  describe('sync', () => {
    const input = { source: 'file', folder: '/notes' }

    it('syncs to the default cache with the state file and forwards progress', async () => {
      const webContents = sender()
      vi.mocked(syncTarget).mockImplementation((_, options) => {
        options.onProgress?.({ synced: 1, deleted: 0, total: 1 })
        return Promise.resolve(syncResult)
      })

      expect(await handler(IPC.sync)({ sender: webContents }, input)).toBe(syncResult)
      expect(syncTarget).toHaveBeenCalledWith(
        input,
        expect.objectContaining({ stateFile, cacheUrl: 'http://default.test' }),
      )
      expect(webContents.send).toHaveBeenCalledWith(IPC.syncProgress, {
        synced: 1,
        deleted: 0,
        total: 1,
      })
    })

    it('syncs to the cache named by CACHE_URL', async () => {
      process.env['CACHE_URL'] = 'http://cache.test'
      vi.mocked(syncTarget).mockResolvedValue(syncResult)

      await handler(IPC.sync)({ sender: sender() }, input)

      expect(syncTarget).toHaveBeenCalledWith(
        input,
        expect.objectContaining({ cacheUrl: 'http://cache.test' }),
      )
    })

    it('does not send progress to a destroyed sender', async () => {
      const webContents = sender(true)
      vi.mocked(syncTarget).mockImplementation((_, options) => {
        options.onProgress?.({ synced: 1, deleted: 0, total: 1 })
        return Promise.resolve(syncResult)
      })

      await handler(IPC.sync)({ sender: webContents }, input)

      expect(webContents.send).not.toHaveBeenCalled()
    })
  })

  describe('selectSource and loadLast', () => {
    it('selectSource forwards the source and the state file', async () => {
      vi.mocked(selectSource).mockResolvedValue(selection)

      expect(await handler(IPC.selectSource)({}, 'bear')).toBe(selection)
      expect(selectSource).toHaveBeenCalledWith('bear', stateFile)
    })

    it('loadLast reads the selection from the state file', async () => {
      vi.mocked(loadLastSelection).mockResolvedValue(selection)

      expect(await handler(IPC.loadLast)({})).toBe(selection)
      expect(loadLastSelection).toHaveBeenCalledWith(stateFile)
    })
  })
})
