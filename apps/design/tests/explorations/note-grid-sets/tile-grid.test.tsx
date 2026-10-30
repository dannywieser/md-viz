import { fireEvent, render, screen } from '@testing-library/react'
import { placeTiles } from '../../../src/explorations/note-grid-sets/tile-layout'
import { TileGrid } from '../../../src/explorations/note-grid-sets/tile-grid'

const sets = [
  { id: 'a', name: 'set a', count: 4, color: 0 },
  { id: 'b', name: 'set b', count: 3, color: 1 },
]

function renderGrid() {
  const fit = { ...placeTiles([4, 3], [1, 2], 4, 4), unit: 20 }
  render(<TileGrid sets={sets} fit={fit} />)
  const svg = screen.getByRole('img')
  svg.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect
  return { svg, fit }
}

describe('TileGrid', () => {
  it('draws one square per note, one outline and the totals in the bar', () => {
    renderGrid()

    expect(document.querySelectorAll('svg rect')).toHaveLength(7)
    expect(document.querySelectorAll('svg > path')).toHaveLength(1)
    expect(screen.getByText('2 sets, 7 notes')).toBeInTheDocument()
  })

  it('draws the set with the bigger squares bigger', () => {
    renderGrid()

    const widths = [...document.querySelectorAll('svg rect')].map((r) => r.getAttribute('width'))
    expect(new Set(widths)).toEqual(new Set(['20', '40']))
  })

  it('names the hovered set and note and outlines the whole square', () => {
    const { svg } = renderGrid()

    fireEvent.pointerMove(svg, { clientX: 1, clientY: 1 })

    expect(screen.getByText('set b')).toBeInTheDocument()
    expect(screen.getByText('note 1')).toBeInTheDocument()
    expect(document.querySelector('.note-hover')?.getAttribute('width')).toBe('40')
    fireEvent.pointerLeave(svg)
    expect(document.querySelector('.note-hover')).toBeNull()
  })

  it('shows nothing outside the grid', () => {
    const { svg } = renderGrid()

    fireEvent.pointerMove(svg, { clientX: 500, clientY: 1 })

    expect(document.querySelector('.note-hover')).toBeNull()
  })
})
