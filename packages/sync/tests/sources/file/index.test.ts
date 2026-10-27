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
})
