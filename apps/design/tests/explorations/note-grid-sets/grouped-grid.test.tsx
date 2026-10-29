import { fireEvent, render, screen } from '@testing-library/react'
import { GroupedGrid } from '../../../src/explorations/note-grid-sets/grouped-grid'

const sets = [
  { id: 'a', name: 'set a', count: 7, color: 0 },
  { id: 'b', name: 'set b', count: 1, color: 1 },
]

function renderGrid(outlined: boolean) {
  render(<GroupedGrid sets={sets} outlined={outlined} width={200} height={100} />)
  const svg = screen.getByRole('img')
  svg.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect
  return svg
}

describe('GroupedGrid', () => {
  it('draws one square per note', () => {
    renderGrid(false)

    expect(document.querySelectorAll('svg rect')).toHaveLength(8)
  })

  it('colours the squares by set', () => {
    renderGrid(false)

    const fills = [...document.querySelectorAll('svg rect')].map((rect) => (rect as SVGElement).style.fill)
    expect(fills.filter((fill) => fill === 'var(--note-0)')).toHaveLength(7)
    expect(fills.filter((fill) => fill === 'var(--note-1)')).toHaveLength(1)
  })

  it('outlines the groups only when asked', () => {
    renderGrid(false)
    expect(document.querySelectorAll('path')).toHaveLength(0)
  })

  it('draws an outline per group', () => {
    renderGrid(true)

    expect(document.querySelectorAll('path')).toHaveLength(2)
  })

  it('names the hovered note and outlines its square', () => {
    const svg = renderGrid(false)

    fireEvent.pointerMove(svg, { clientX: 1, clientY: 1 })

    expect(screen.getByRole('tooltip')).toHaveTextContent('set a note 1')
    expect(document.querySelector('.note-hover')).not.toBeNull()
  })

  it('shows no tooltip in the empty part of a group, off the groups or after leaving', () => {
    const svg = renderGrid(false)
    const cell = Number(document.querySelector('.note-square')?.getAttribute('width'))

    // set a: 7 notes in 3 columns, so the cell after the last note of the third row is empty
    fireEvent.pointerMove(svg, { clientX: cell * 2 + 1, clientY: cell * 2 + 1 })
    expect(screen.queryByRole('tooltip')).toBeNull()

    fireEvent.pointerMove(svg, { clientX: 199, clientY: 99 })
    expect(screen.queryByRole('tooltip')).toBeNull()

    fireEvent.pointerMove(svg, { clientX: 1, clientY: 1 })
    fireEvent.pointerLeave(svg)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})
