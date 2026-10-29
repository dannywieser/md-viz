import { act, render, screen } from '@testing-library/react'
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

const report = (cell: number) =>
  act(() => vi.mocked(NoteGrid).mock.calls.at(-1)![0].onCellChange!(cell))

describe('LatticeDemo', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('gives the grid the count of notes and its fixed area', () => {
    render(<LatticeDemo count={50} />)

    const props = vi.mocked(NoteGrid).mock.calls[0][0]
    expect(props.notes).toHaveLength(50)
    expect(props.height).toBe(200)
  })

  it('shows nothing about the cell until the grid reports one', () => {
    render(<LatticeDemo count={50} />)

    expect(screen.queryByText('dot spacing')).toBeNull()
  })

  it('says a small cell gets a whole multiple of it', () => {
    render(<LatticeDemo count={1200} />)
    report(7)

    expect(screen.getByText('7px')).toBeInTheDocument()
    expect(screen.getByText('21px')).toBeInTheDocument()
    expect(
      screen.getByText(/under 16px: a whole multiple of the cell, 3 cells/),
    ).toBeInTheDocument()
  })

  it('says a middling cell is used as it is', () => {
    render(<LatticeDemo count={150} />)
    report(21)

    expect(screen.getAllByText('21px')).toHaveLength(2)
    expect(screen.getByText('from 16 to 32px: the cell itself')).toBeInTheDocument()
  })

  it('says a big cell is divided evenly, and highlights that line of code', () => {
    render(<LatticeDemo count={4} />)
    report(98)

    expect(screen.getByText('98px')).toBeInTheDocument()
    expect(screen.getByText('24.5px')).toBeInTheDocument()
    expect(screen.getByText(/over 32px: the cell divided evenly, into 4/)).toBeInTheDocument()
    expect(screen.getByText(/if \(cell > max\)/)).toHaveClass('bg-primary')
  })

  it('sets the lattice on its own box, not the page', () => {
    const { container } = render(<LatticeDemo count={150} />)
    report(21)

    expect(
      container.querySelector<HTMLElement>('.bg-dots')!.style.getPropertyValue('--grid-size'),
    ).toBe('21px')
    expect(document.documentElement.style.getPropertyValue('--grid-size')).toBe('')
  })
})
