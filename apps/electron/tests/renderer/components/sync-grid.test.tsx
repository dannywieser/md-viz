import { render } from '@testing-library/react'
import { NoteGrid, useGridLattice } from '@md-viz/ui'
import { SyncGrid } from '../../../src/renderer/src/components/sync-grid'
import type { NoteSet } from '../../../src/shared/ipc'

vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  NoteGrid: vi.fn(() => <div data-testid="note-grid" />),
  useGridLattice: vi.fn(),
}))

const ref = { current: null }
const onCellChange = vi.fn()
const set = (notes: NoteSet['notes']): NoteSet => ({ id: 'a', name: 'a', color: 1, notes })

describe('SyncGrid', () => {
  beforeEach(() => {
    vi.mocked(useGridLattice).mockReturnValue({ ref, cell: null, onCellChange })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('draws the sets in one grid with the lattice ref and cell callback', () => {
    const sets = [set([{ id: 'n', title: 'plan' }])]
    render(<SyncGrid sets={sets} />)

    expect(vi.mocked(NoteGrid).mock.lastCall![0]).toMatchObject({ sets, ref, onCellChange })
  })

  it('lines the page up only while some set has notes', () => {
    const { rerender } = render(<SyncGrid sets={[set([{ id: 'n', title: 'plan' }])]} />)
    expect(useGridLattice).toHaveBeenLastCalledWith(true)

    rerender(<SyncGrid sets={[set([])]} />)
    expect(useGridLattice).toHaveBeenLastCalledWith(false)

    rerender(<SyncGrid sets={[]} />)
    expect(useGridLattice).toHaveBeenLastCalledWith(false)
  })
})
