import { fireEvent, render, screen } from '@testing-library/react'
import { ContainerGrid } from '../../../src/explorations/note-grid-sets/container-grid'

const sets = [
  { id: 'b', name: 'set b', count: 2, color: 1 },
  { id: 'a', name: 'set a', count: 9, color: 0 },
]

function renderGrid(outlined = false) {
  render(<ContainerGrid sets={sets} outlined={outlined} width={200} height={100} />)
  const svg = screen.getByRole('img')
  svg.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect
  return svg
}

describe('ContainerGrid', () => {
  it('draws one square per note on the empty squares', () => {
    renderGrid()

    expect(document.querySelectorAll('svg rect')).toHaveLength(11)
    expect(document.querySelectorAll('svg > path')).toHaveLength(1)
  })

  it('puts the biggest set first at the top-left', () => {
    renderGrid()

    const first = document.querySelector('.note-square') as SVGElement
    expect(first.style.fill).toBe('var(--note-0)')
    expect(first.getAttribute('x')).toBe('0')
  })

  it('sizes the container to its squares and floats it as a card', () => {
    renderGrid()

    const svg = screen.getByRole('img')
    expect(svg).toHaveClass('bg-card', 'shadow-hard')
    expect(Number(svg.getAttribute('width'))).toBeLessThanOrEqual(200)
    expect(Number(svg.getAttribute('height'))).toBeLessThanOrEqual(100)
  })

  it('outlines the groups when asked', () => {
    renderGrid(true)

    expect(document.querySelectorAll('g > path')).toHaveLength(2)
  })

  it('names the hovered note', () => {
    const svg = renderGrid()

    fireEvent.pointerMove(svg, { clientX: 1, clientY: 1 })

    expect(screen.getByRole('tooltip')).toHaveTextContent('set a note 1')
    expect(document.querySelector('.note-hover')).not.toBeNull()
  })

  it('shows no tooltip on an empty square, off the container or after leaving', () => {
    const svg = renderGrid()

    fireEvent.pointerMove(svg, { clientX: 199, clientY: 99 })
    expect(screen.queryByRole('tooltip')).toBeNull()

    fireEvent.pointerMove(svg, { clientX: -5, clientY: 1 })
    expect(screen.queryByRole('tooltip')).toBeNull()

    fireEvent.pointerMove(svg, { clientX: 1, clientY: 1 })
    fireEvent.pointerLeave(svg)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})
