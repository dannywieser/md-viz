import { render, screen } from '@testing-library/react'
import { NoteGrid } from '@md-viz/ui'
import { AllNotesGrid } from '../../src/components/all-notes-grid'

vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  NoteGrid: vi.fn(() => <div data-testid="note-grid" />),
}))

const notes = [{ id: 'a', title: 'plan' }]

describe('AllNotesGrid', () => {
  it('shows every note in a grid labelled all notes', () => {
    render(<AllNotesGrid notes={notes} />)

    expect(screen.getByTestId('note-grid')).toBeInTheDocument()
    expect(vi.mocked(NoteGrid).mock.lastCall![0]).toMatchObject({
      label: 'all notes',
      sets: [{ id: 'all', name: 'all notes', color: 24, notes }],
    })
  })

  it('hands the lattice ref and cell callback to the grid', () => {
    const gridRef = { current: null }
    const onCellChange = vi.fn()
    render(<AllNotesGrid notes={notes} gridRef={gridRef} onCellChange={onCellChange} />)

    const props = vi.mocked(NoteGrid).mock.lastCall![0]
    expect(props.ref).toBe(gridRef)
    expect(props.onCellChange).toBe(onCellChange)
  })
})
