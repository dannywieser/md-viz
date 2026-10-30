import { render, screen } from '@testing-library/react'
import { NoteGrid } from '@md-viz/ui'
import { LatticeDemo } from '../../src/sections/lattice-demo'

vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  NoteGrid: vi.fn(({ ref }: { ref: React.Ref<HTMLDivElement> }) => (
    <div ref={ref} data-testid="note-grid">
      <svg>
        <rect className="note-square" />
      </svg>
    </div>
  )),
}))

describe('LatticeDemo', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('gives the grid the count of notes in three sets, in a box of fixed size', () => {
    const { container } = render(<LatticeDemo count={50} cell={null} onCellChange={vi.fn()} />)

    const props = vi.mocked(NoteGrid).mock.calls[0][0]
    expect(props.sets).toHaveLength(3)
    expect(props.sets.reduce((sum, set) => sum + set.notes.length, 0)).toBe(50)
    expect(props.sets[0].notes.length).toBeGreaterThan(props.sets[2].notes.length)
    expect(container.querySelector('.bg-dots')?.firstElementChild).toHaveStyle({
      width: '360px',
      height: '232px',
    })
  })

  it('makes fewer sets for fewer notes', () => {
    render(<LatticeDemo count={2} cell={null} onCellChange={vi.fn()} />)

    expect(vi.mocked(NoteGrid).mock.calls[0][0].sets).toHaveLength(2)
  })

  it('passes the cell the grid reports on', () => {
    const onCellChange = vi.fn()
    render(<LatticeDemo count={50} cell={null} onCellChange={onCellChange} />)

    vi.mocked(NoteGrid).mock.calls[0][0].onCellChange!(35)

    expect(onCellChange).toHaveBeenCalledWith(35)
  })

  it('shows nothing about the cell until there is one', () => {
    render(<LatticeDemo count={50} cell={null} onCellChange={vi.fn()} />)

    expect(screen.queryByText('dot spacing')).toBeNull()
  })

  it('says a small cell gets a whole multiple of it', () => {
    render(<LatticeDemo count={1200} cell={7} onCellChange={vi.fn()} />)

    expect(screen.getByText('7px')).toBeInTheDocument()
    expect(screen.getByText('21px')).toBeInTheDocument()
    expect(
      screen.getByText(/under 16px: a whole multiple of the cell, 3 cells/),
    ).toBeInTheDocument()
  })

  it('says a middling cell is used as it is', () => {
    render(<LatticeDemo count={150} cell={21} onCellChange={vi.fn()} />)

    expect(screen.getAllByText('21px')).toHaveLength(2)
    expect(screen.getByText('from 16 to 32px: the cell itself')).toBeInTheDocument()
  })

  it('says a big cell is divided evenly', () => {
    render(<LatticeDemo count={4} cell={98} onCellChange={vi.fn()} />)

    expect(screen.getByText('98px')).toBeInTheDocument()
    expect(screen.getByText('24.5px')).toBeInTheDocument()
    expect(screen.getByText(/over 32px: the cell divided evenly, into 4/)).toBeInTheDocument()
  })

  it('sets the lattice on its own box, not the page', () => {
    const { container } = render(<LatticeDemo count={150} cell={21} onCellChange={vi.fn()} />)

    expect(
      container.querySelector<HTMLElement>('.bg-dots')!.style.getPropertyValue('--grid-size'),
    ).toBe('21px')
    expect(document.documentElement.style.getPropertyValue('--grid-size')).toBe('')
  })
})
