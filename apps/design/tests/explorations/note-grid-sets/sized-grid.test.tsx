import { fireEvent, render, screen } from '@testing-library/react'
import { SizedGrid } from '../../../src/explorations/note-grid-sets/sized-grid'

const sets = [
  { id: 'a', name: 'set a', count: 4, color: 0 },
  { id: 'b', name: 'set b', count: 50, color: 1 },
  { id: 'c', name: 'set c', count: 1, color: 2 },
]

function renderGrid(rule: 'round' | 'ceil' | 'rectangle' = 'rectangle', labels: 'none' | 'inside' = 'none') {
  render(<SizedGrid sets={sets} rule={rule} labels={labels} width={200} height={100} />)
  const svg = screen.getByRole('img')
  svg.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect
  return svg
}

describe('SizedGrid', () => {
  it('draws one block per set', () => {
    renderGrid()

    expect(document.querySelectorAll('svg rect')).toHaveLength(3)
  })

  it('puts the biggest set first and marks it as the lattice reference', () => {
    renderGrid()

    const first = document.querySelector('.note-square') as SVGRectElement
    expect(first.getAttribute('x')).toBe('0')
    expect(Number(first.getAttribute('width'))).toBeGreaterThan(
      Number(document.querySelectorAll('svg rect')[2].getAttribute('width')),
    )
  })

  it('sizes every block in whole cells', () => {
    renderGrid('round')

    const rects = [...document.querySelectorAll('svg rect')]
    const cell = Number(rects[2].getAttribute('width'))
    for (const rect of rects) {
      expect(Number(rect.getAttribute('width')) % cell).toBe(0)
      expect(Number(rect.getAttribute('x')) % cell).toBe(0)
    }
  })

  it('labels the blocks when asked', () => {
    renderGrid('rectangle', 'inside')

    expect(document.querySelectorAll('text').length).toBeGreaterThan(0)
  })

  it('names the hovered block and outlines it', () => {
    const svg = renderGrid()

    fireEvent.pointerMove(svg, { clientX: 1, clientY: 1 })

    expect(screen.getByRole('tooltip')).toHaveTextContent('set b: 50 notes, 56 cells')
    expect(document.querySelector('.note-hover')).not.toBeNull()
  })

  it('shows no tooltip off the blocks and when the pointer leaves', () => {
    const svg = renderGrid()

    fireEvent.pointerMove(svg, { clientX: 199, clientY: 99 })
    expect(screen.queryByRole('tooltip')).toBeNull()

    fireEvent.pointerMove(svg, { clientX: 1, clientY: 1 })
    fireEvent.pointerLeave(svg)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})
