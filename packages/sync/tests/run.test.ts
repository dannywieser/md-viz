import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { loadBearNotes } from '../src/sources/bear/load'
import { loadFileNotes } from '../src/sources/file/load'
import type { LoadedNotes } from '../src/sources/types'
import { loadLastSelection, rememberFolder, scanTarget, selectSource, syncTarget } from '../src/run'
import { scanBear } from '../src/sources/bear/scan'
import { scanMarkdown } from '../src/sources/file/scan'
import { readState } from '../src/state'
import { syncNotes } from '../src/pipeline/sync'
import type { SyncResult } from '../src/types'

vi.mock('../src/sources/file/scan', () => ({ scanMarkdown: vi.fn() }))
vi.mock('../src/sources/bear/scan', () => ({ scanBear: vi.fn() }))
vi.mock('../src/sources/bear/load', () => ({ loadBearNotes: vi.fn() }))
vi.mock('../src/sources/file/load', () => ({ loadFileNotes: vi.fn() }))
vi.mock('../src/pipeline/sync', () => ({ syncNotes: vi.fn() }))

const syncResult: SyncResult = {
  scanned: 1,
  synced: 1,
  unchanged: 0,
  deleted: 0,
  failed: 0,
  notes: { updated: [{ id: 'a', title: 'a' }], deleted: [], unchanged: [] },
}

describe('run', () => {
  let dir: string
  let folder: string
  let stateFile: string

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'md-viz-run-'))
    folder = path.join(dir, 'notes')
    await mkdir(folder)
    stateFile = path.join(dir, 'state.json')
  })

  afterEach(async () => {
    vi.clearAllMocks()
    await rm(dir, { recursive: true, force: true })
  })

  describe('scanTarget', () => {
    it('scans a folder and forwards progress', async () => {
      const onProgress = vi.fn()
      vi.mocked(scanMarkdown).mockResolvedValue({ count: 2 })

      expect(await scanTarget({ source: 'file', folder }, onProgress)).toEqual({ count: 2 })
      expect(scanMarkdown).toHaveBeenCalledWith(folder, onProgress)
    })

    it('counts the Bear notes without a folder', async () => {
      vi.mocked(scanBear).mockResolvedValue({ count: 7 })

      expect(await scanTarget({ source: 'bear' })).toEqual({ count: 7 })
      expect(scanMarkdown).not.toHaveBeenCalled()
    })

    it('rejects an invalid target before scanning', async () => {
      await expect(scanTarget({ source: 'file', folder: 'relative' })).rejects.toThrow(
        'expected an absolute folder path',
      )
      expect(scanMarkdown).not.toHaveBeenCalled()
    })
  })

  describe('syncTarget', () => {
    const loaded: LoadedNotes = { notes: [], failed: [] }
    const options = () => ({ stateFile, cacheUrl: 'http://cache.test' })

    beforeEach(() => {
      vi.mocked(loadFileNotes).mockResolvedValue(loaded)
      vi.mocked(loadBearNotes).mockResolvedValue(loaded)
      vi.mocked(syncNotes).mockResolvedValue(syncResult)
    })

    it('syncs a folder to the given cache, forwards progress and records the sync', async () => {
      const onProgress = vi.fn()
      vi.mocked(syncNotes).mockImplementation((_s, _l, opts) => {
        opts?.onProgress?.({ synced: 1, deleted: 0, total: 1 })
        return Promise.resolve(syncResult)
      })

      const result = await syncTarget({ source: 'file', folder }, { ...options(), onProgress })

      expect(result).toBe(syncResult)
      expect(loadFileNotes).toHaveBeenCalledWith(folder)
      expect(syncNotes).toHaveBeenCalledWith(
        'file',
        loaded,
        expect.objectContaining({ baseUrl: 'http://cache.test' }),
      )
      expect(onProgress).toHaveBeenCalledWith({ synced: 1, deleted: 0, total: 1 })
      const state = await readState(stateFile)
      expect(state.lastSource).toBe('file')
      expect(state.lastFolder).toBe(folder)
      expect(state.syncs[`file:${folder}`]?.notes).toEqual(syncResult.notes)
      expect(Date.parse(state.syncs[`file:${folder}`]?.syncedAt ?? '')).not.toBeNaN()
    })

    it('syncs Bear without a folder and records it under its own key', async () => {
      await syncTarget({ source: 'bear' }, options())

      expect(loadBearNotes).toHaveBeenCalled()
      expect(loadFileNotes).not.toHaveBeenCalled()
      expect(syncNotes).toHaveBeenCalledWith('bear', loaded, expect.anything())
      const state = await readState(stateFile)
      expect(state.lastSource).toBe('bear')
      expect(state.lastFolder).toBeNull()
      expect(state.syncs['bear']?.notes).toEqual(syncResult.notes)
    })

    it('rejects an invalid target before loading anything', async () => {
      await expect(syncTarget({ source: 'file', folder: 'relative' }, options())).rejects.toThrow(
        'expected an absolute folder path',
      )
      expect(loadFileNotes).not.toHaveBeenCalled()
      expect(syncNotes).not.toHaveBeenCalled()
    })

    it('records nothing when loading fails', async () => {
      vi.mocked(loadBearNotes).mockRejectedValue(new Error('bear is not installed'))

      await expect(syncTarget({ source: 'bear' }, options())).rejects.toThrow(
        'bear is not installed',
      )
      expect((await readState(stateFile)).syncs).toEqual({})
    })

    it('records nothing when the sync fails', async () => {
      vi.mocked(syncNotes).mockRejectedValue(new Error('cache is down'))

      await expect(syncTarget({ source: 'bear' }, options())).rejects.toThrow('cache is down')
      expect((await readState(stateFile)).syncs).toEqual({})
    })
  })

  describe('rememberFolder', () => {
    it('remembers the folder and the file source', async () => {
      await rememberFolder(stateFile, '/notes')

      expect(await readState(stateFile)).toMatchObject({
        lastSource: 'file',
        lastFolder: '/notes',
      })
    })
  })

  describe('selectSource and loadLastSelection', () => {
    it('selectSource remembers Bear and returns its last sync', async () => {
      vi.mocked(syncNotes).mockResolvedValue(syncResult)
      vi.mocked(loadBearNotes).mockResolvedValue({ notes: [], failed: [] })
      await syncTarget({ source: 'bear' }, { stateFile, cacheUrl: 'http://cache.test' })

      const selection = await selectSource('bear', stateFile)

      expect(selection).toMatchObject({ source: 'bear', folder: null })
      expect(selection.lastSync?.notes).toEqual(syncResult.notes)
      expect((await readState(stateFile)).lastSource).toBe('bear')
    })

    it('selectSource rejects an unknown source and changes nothing', async () => {
      await expect(selectSource('notion', stateFile)).rejects.toThrow('expected a source')
      expect(await readState(stateFile)).toMatchObject({ lastSource: 'file', syncs: {} })
    })

    it('loadLastSelection returns the saved folder with its sync', async () => {
      vi.mocked(syncNotes).mockResolvedValue(syncResult)
      vi.mocked(loadFileNotes).mockResolvedValue({ notes: [], failed: [] })
      await syncTarget({ source: 'file', folder }, { stateFile, cacheUrl: 'http://cache.test' })

      const selection = await loadLastSelection(stateFile)

      expect(selection).toMatchObject({ source: 'file', folder })
      expect(selection.lastSync?.notes).toEqual(syncResult.notes)
    })

    it('loadLastSelection returns the saved folder with no sync when it was never synced', async () => {
      await rememberFolder(stateFile, folder)

      expect(await loadLastSelection(stateFile)).toEqual({
        source: 'file',
        folder,
        lastSync: null,
      })
    })

    it.each([
      ['no folder was saved', null],
      ['the saved folder is gone', 'missing'],
    ])('loadLastSelection returns no folder when %s', async (_, saved) => {
      if (saved) await rememberFolder(stateFile, path.join(folder, saved))

      expect(await loadLastSelection(stateFile)).toEqual({
        source: 'file',
        folder: null,
        lastSync: null,
      })
    })

    it('loadLastSelection returns Bear when it was the last source', async () => {
      await selectSource('bear', stateFile)

      expect(await loadLastSelection(stateFile)).toEqual({
        source: 'bear',
        folder: null,
        lastSync: null,
      })
    })
  })
})
