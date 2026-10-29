import { fireEvent, render, screen } from '@testing-library/react'
import { StripedGrid } from '../../../src/explorations/note-palettes/striped-grid'

const colors = ['#ff0000', '#00ff00', '#0000ff']

describe('StripedGrid', () => {
  it('draws one stripe per colour of each note', () => {
    const { container } = render(
      <StripedGrid colors={colors} notes={[[0], [1, 2], [0, 1, 2]]} cell={6} columns={2} />,
    )

    expect(container.querySelectorAll('rect')).toHaveLength(6)
  })

  it('sizes the svg from the cell and the columns', () => {
    render(<StripedGrid colors={colors} notes={[[0], [1], [2]]} cell={6} columns={2} />)

    const svg = screen.getByRole('img', { name: '3 notes, 6px squares' })
    expect(svg).toHaveAttribute('width', '12')
    expect(svg).toHaveAttribute('height', '12')
  })

  it('stacks the stripes of a note from the top of its cell', () => {
    const { container } = render(
      <StripedGrid colors={colors} notes={[[0, 1, 2]]} cell={6} columns={1} />,
    )

    const rects = [...container.querySelectorAll('rect')]
    expect(rects.map((rect) => rect.getAttribute('y'))).toEqual(['0', '2', '4'])
    expect(rects.map((rect) => rect.getAttribute('fill'))).toEqual(colors)
  })
})

describe('StripedGrid hover', () => {
  const notes = [[0], [1, 2], [0, 1, 2], [2]]

  function renderGrid() {
    const view = render(<StripedGrid colors={colors} notes={notes} cell={10} columns={2} />)
    const svg = screen.getByRole('img')
    svg.getBoundingClientRect = () => ({ left: 100, top: 50 }) as DOMRect
    return { ...view, svg }
  }

  it('outlines the square under the pointer and names its colours', () => {
    const { container, svg } = renderGrid()

    fireEvent.pointerMove(svg, { clientX: 112, clientY: 53 })

    const outline = container.querySelector('.note-hover')!
    expect(outline).toHaveAttribute('x', '10')
    expect(outline).toHaveAttribute('y', '0')
    expect(screen.getByRole('tooltip')).toHaveTextContent('note 1: color 1, 2')
  })

  it('follows the pointer to another row', () => {
    const { container, svg } = renderGrid()

    fireEvent.pointerMove(svg, { clientX: 105, clientY: 65 })

    expect(container.querySelector('.note-hover')).toHaveAttribute('y', '10')
    expect(screen.getByRole('tooltip')).toHaveTextContent('note 2: color 0, 1, 2')
  })

  it('shows nothing outside the notes or after the pointer leaves', () => {
    const { container, svg } = renderGrid()

    fireEvent.pointerMove(svg, { clientX: 130, clientY: 55 })
    expect(container.querySelector('.note-hover')).toBeNull()

    fireEvent.pointerMove(svg, { clientX: 105, clientY: 55 })
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.pointerLeave(svg)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows nothing past the last note', () => {
    const { svg } = renderGrid()

    fireEvent.pointerMove(svg, { clientX: 105, clientY: 75 })
    fireEvent.pointerMove(svg, { clientX: 105, clientY: 95 })

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
