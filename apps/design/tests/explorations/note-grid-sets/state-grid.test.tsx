import { fireEvent, render, screen } from '@testing-library/react'
import { groupStates } from '../../../src/explorations/note-grid-sets/group-states'
import { StateGrid } from '../../../src/explorations/note-grid-sets/state-grid'

const sets = [
  { id: 'a', name: 'set a', count: 6, color: 0 },
  { id: 'b', name: 'set b', count: 2, color: 1 },
]
const states = groupStates([6, 2], 200, 100)

function renderGrid(grouped: boolean, onToggle = vi.fn()) {
  render(<StateGrid sets={sets} states={states} grouped={grouped} onToggle={onToggle} />)
  const svg = screen.getByRole('img')
  svg.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect
  return svg
}

describe('StateGrid', () => {
  it('draws one square per note in either state', () => {
    renderGrid(true)

    expect(document.querySelectorAll('svg rect:not(.note-hover)')).toHaveLength(8 + 4)
    expect(screen.getByText('2 sets, 8 notes')).toBeInTheDocument()
  })

  it('moves the squares when the state changes', () => {
    const { rerender } = render(
      <StateGrid sets={sets} states={states} grouped onToggle={vi.fn()} />,
    )
    const moves = () =>
      [...document.querySelectorAll('svg > rect')].map((r) => (r as SVGElement).style.transform)
    const before = moves()

    rerender(<StateGrid sets={sets} states={states} grouped={false} onToggle={vi.fn()} />)

    expect(moves()).not.toEqual(before)
  })

  it('shows the outline only when grouped', () => {
    const { rerender } = render(
      <StateGrid sets={sets} states={states} grouped onToggle={vi.fn()} />,
    )
    const outline = () => document.querySelector('[data-outline]') as SVGElement
    expect(outline().style.opacity).toBe('1')

    rerender(<StateGrid sets={sets} states={states} grouped={false} onToggle={vi.fn()} />)

    expect(outline().style.opacity).toBe('0')
  })

  it('has the toggle in the header bar', () => {
    const onToggle = vi.fn()
    renderGrid(true, onToggle)

    fireEvent.click(screen.getByRole('button', { name: 'ungroup notes' }))

    expect(onToggle).toHaveBeenCalled()
  })

  it('names the hovered set and note in the bar and outlines the square', () => {
    const svg = renderGrid(true)

    fireEvent.pointerMove(svg, { clientX: 1, clientY: 1 })

    expect(screen.getByText(/^set [ab]$/)).toBeInTheDocument()
    expect(screen.getByText(/^note \d+$/)).toBeInTheDocument()
    expect(document.querySelector('.note-hover')).not.toBeNull()
    fireEvent.pointerLeave(svg)
    expect(document.querySelector('.note-hover')).toBeNull()
  })

  it('numbers the hovered note in the whole list when not grouped', () => {
    const svg = renderGrid(false)

    fireEvent.pointerMove(svg, { clientX: 1, clientY: 1 })

    expect(screen.getByText('note 1')).toBeInTheDocument()
  })

  it('shows nothing outside the grid', () => {
    const svg = renderGrid(false)

    fireEvent.pointerMove(svg, { clientX: 900, clientY: 1 })

    expect(document.querySelector('.note-hover')).toBeNull()
  })
})
