import { fireEvent, render, screen } from '@testing-library/react'
import { FlowGrid } from '../../../src/explorations/note-grid-sets/flow-grid'
import { flowLayout } from '../../../src/explorations/note-grid-sets/flow-layout'

const sets = [
  { id: 'a', name: 'set a', count: 6, color: 0 },
  { id: 'b', name: 'set b', count: 2, color: 1 },
]

function renderGrid() {
  const fit = flowLayout([6, 2], 200, 100)
  render(<FlowGrid sets={sets} fit={fit} />)
  const svg = screen.getByRole('img')
  svg.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect
  return { svg, fit }
}

describe('FlowGrid', () => {
  it('draws one square per note, one outline and the totals in the bar', () => {
    renderGrid()

    expect(document.querySelectorAll('svg rect')).toHaveLength(8)
    expect(document.querySelectorAll('svg > path')).toHaveLength(1)
    expect(screen.getByText('2 sets, 8 notes')).toBeInTheDocument()
  })

  it('names the hovered set and note in the bar and outlines the square', () => {
    const { svg } = renderGrid()

    fireEvent.pointerMove(svg, { clientX: 1, clientY: 1 })

    expect(screen.getByText('set a')).toBeInTheDocument()
    expect(screen.getByText('note 1')).toBeInTheDocument()
    expect(document.querySelector('.note-hover')).not.toBeNull()
    fireEvent.pointerLeave(svg)
    expect(document.querySelector('.note-hover')).toBeNull()
  })

  it('shows nothing outside the grid', () => {
    const { svg, fit } = renderGrid()

    fireEvent.pointerMove(svg, { clientX: fit.columns * fit.cell + 20, clientY: 1 })

    expect(document.querySelector('.note-hover')).toBeNull()
  })
})
