import { bearSource } from '../../../src/sources/bear'
import { loadBearNotes } from '../../../src/sources/bear/load'
import { scanBear } from '../../../src/sources/bear/scan'

vi.mock('../../../src/sources/bear/load', () => ({ loadBearNotes: vi.fn() }))
vi.mock('../../../src/sources/bear/scan', () => ({ scanBear: vi.fn() }))

const target = { source: 'bear' } as const

describe('bearSource', () => {
  it('loads the Bear notes', async () => {
    const loaded = { notes: [], failed: [] }
    vi.mocked(loadBearNotes).mockResolvedValue(loaded)

    expect(await bearSource.load(target)).toBe(loaded)
  })

  it('counts the Bear notes', async () => {
    vi.mocked(scanBear).mockResolvedValue({ count: 7 })

    expect(await bearSource.scan(target)).toEqual({ count: 7 })
  })
})
