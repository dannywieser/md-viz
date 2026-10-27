import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { AppState } from '../../../src/state'
import { fileSource } from '../../../src/sources/file'
import { loadFileNotes } from '../../../src/sources/file/load'
import { scanMarkdown } from '../../../src/sources/file/scan'

vi.mock('../../../src/sources/file/load', () => ({ loadFileNotes: vi.fn() }))
vi.mock('../../../src/sources/file/scan', () => ({ scanMarkdown: vi.fn() }))

const target = { source: 'file', folder: '/notes' } as const

describe('fileSource', () => {
  it('loads the notes of the target folder', async () => {
    const loaded = { notes: [], failed: [] }
    vi.mocked(loadFileNotes).mockResolvedValue(loaded)

    expect(await fileSource.load(target)).toBe(loaded)
    expect(loadFileNotes).toHaveBeenCalledWith('/notes')
  })

  it('scans the target folder and forwards progress', async () => {
    const onProgress = vi.fn()
    vi.mocked(scanMarkdown).mockResolvedValue({ count: 3 })

    expect(await fileSource.scan(target, onProgress)).toEqual({ count: 3 })
    expect(scanMarkdown).toHaveBeenCalledWith('/notes', onProgress)
  })

  describe('state and parsing', () => {
    let folder: string
    const state = (lastFolder: string | null): AppState => ({
      lastSource: 'file',
      lastFolder,
      syncs: {},
    })

    beforeEach(async () => {
      folder = await mkdtemp(path.join(tmpdir(), 'md-viz-file-source-'))
    })

    afterEach(async () => {
      await rm(folder, { recursive: true, force: true })
    })

    it('parses a target with an existing folder and rejects an invalid one', async () => {
      expect(await fileSource.parse({ source: 'file', folder })).toEqual({
        source: 'file',
        folder,
      })
      await expect(fileSource.parse({ source: 'file' })).rejects.toThrow(
        'expected an absolute folder path',
      )
    })

    it('keys the last sync by folder', () => {
      expect(fileSource.key({ source: 'file', folder: '/notes' })).toBe('file:/notes')
      expect(fileSource.key({ source: 'file', folder: '/other' })).not.toBe('file:/notes')
    })

    it('remembers the folder', () => {
      const remembered = state(null)

      fileSource.remember(remembered, { source: 'file', folder: '/notes' })

      expect(remembered.lastFolder).toBe('/notes')
    })

    it('restores the remembered folder while it exists', async () => {
      expect(await fileSource.restore(state(folder))).toEqual({ source: 'file', folder })
    })

    it.each([
      ['none was remembered', null],
      ['the remembered folder is gone', 'missing'],
    ])('restores nothing when %s', async (_, saved) => {
      expect(await fileSource.restore(state(saved && path.join(folder, saved)))).toBeNull()
    })
  })
})
