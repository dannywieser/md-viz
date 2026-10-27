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

  it('parses any Bear target as the plain Bear target', async () => {
    expect(await bearSource.parse({ source: 'bear', folder: '/ignored' })).toEqual(target)
  })

  it('keys the last sync with one key for the whole library', () => {
    expect(bearSource.key(target)).toBe('bear')
  })

  it('remembers nothing and always restores the Bear target', async () => {
    const state = { lastSource: 'bear', lastFolder: null, syncs: {} } as const
    const before = structuredClone(state)

    bearSource.remember(structuredClone(state), target)

    expect(await bearSource.restore(state)).toEqual(target)
    expect(state).toEqual(before)
  })
})
