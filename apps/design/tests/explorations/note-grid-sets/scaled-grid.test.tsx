import { fireEvent, render, screen } from '@testing-library/react'
import { ScaledGrid } from '../../../src/explorations/note-grid-sets/scaled-grid'
import { scaleLayout } from '../../../src/explorations/note-grid-sets/scaled-slots'

const sets = [
  { id: 'a', name: 'set a', count: 30, color: 0 },
  { id: 'b', name: 'set b', count: 1, color: 1 },
]

function renderGrid() {
  const fit = scaleLayout([30, 1], 0, 200, 100)
  render(<ScaledGrid sets={sets} fit={fit} />)
  const svg = screen.getByRole('img')
  svg.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect
  return { svg, fit }
}

describe('ScaledGrid', () => {
  it('draws one square and one outline per note and set, and the totals in the bar', () => {
    renderGrid()

    expect(document.querySelectorAll('g rect')).toHaveLength(31)
    expect(document.querySelectorAll('g > path')).toHaveLength(2)
    expect(screen.getByText('2 sets, 31 notes')).toBeInTheDocument()
  })

  it('draws the small set with bigger squares', () => {
    renderGrid()

    const widths = [...document.querySelectorAll('g')].map((g) =>
      Number(g.querySelector('rect')?.getAttribute('width')),
    )
    expect(widths[1]).toBeGreaterThan(widths[0])
  })

  it('names the hovered set and note in the bar and outlines the square', () => {
    const { svg, fit } = renderGrid()
    const slot = fit.slots[0]

    fireEvent.pointerMove(svg, { clientX: slot.x * fit.unit + 1, clientY: slot.y * fit.unit + 1 })

    expect(screen.getByText('set a')).toBeInTheDocument()
    expect(screen.getByText('note 1')).toBeInTheDocument()
    expect(document.querySelector('.note-hover')).not.toBeNull()
    fireEvent.pointerLeave(svg)
    expect(document.querySelector('.note-hover')).toBeNull()
  })

  it('shows nothing for an empty spot', () => {
    const { svg, fit } = renderGrid()

    fireEvent.pointerMove(svg, { clientX: fit.columns * fit.unit + 50, clientY: 1 })

    expect(document.querySelector('.note-hover')).toBeNull()
  })
})
