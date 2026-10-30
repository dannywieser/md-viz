import { render, screen } from '@testing-library/react'
import { NoteGrid } from '@md-viz/ui'
import { TagGrid } from '../../src/components/tag-grid'

vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  NoteGrid: vi.fn(() => <div data-testid="note-grid" />),
}))

const sets = [{ id: 'bear:daily', name: 'daily', color: 3, notes: [{ id: 'a', title: 'plan' }] }]

describe('TagGrid', () => {
  it('shows the tag sets in one grid', () => {
    render(<TagGrid sets={sets} />)

    expect(screen.getByTestId('note-grid')).toBeInTheDocument()
    expect(vi.mocked(NoteGrid).mock.lastCall![0]).toMatchObject({ sets })
  })

  it('hands the lattice ref and cell callback to the grid', () => {
    const gridRef = { current: null }
    const onCellChange = vi.fn()
    render(<TagGrid sets={sets} gridRef={gridRef} onCellChange={onCellChange} />)

    const props = vi.mocked(NoteGrid).mock.lastCall![0]
    expect(props.ref).toBe(gridRef)
    expect(props.onCellChange).toBe(onCellChange)
  })
})
