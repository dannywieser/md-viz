// @vitest-environment node
import { listBearRows, type BearRow } from '../src/bearcli'
import { scanBear } from '../src/scan-bear'

vi.mock('../src/bearcli', () => ({ listBearRows: vi.fn() }))

const row = (locked: 'yes' | 'no'): BearRow => ({
  id: 'x',
  title: 'x',
  locked,
  tags: [],
  created: '',
  modified: '',
  location: 'notes',
})

describe('scanBear', () => {
  it('counts the notes a sync would push: not trashed, not locked', async () => {
    vi.mocked(listBearRows).mockResolvedValue([row('no'), row('yes'), row('no')])

    expect(await scanBear()).toEqual({ count: 2 })
    expect(listBearRows).toHaveBeenCalledWith('id,locked,location')
  })

  it('counts none for an empty library', async () => {
    vi.mocked(listBearRows).mockResolvedValue([])

    expect(await scanBear()).toEqual({ count: 0 })
  })
})
