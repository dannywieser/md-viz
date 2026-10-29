import { fireEvent, render, screen } from '@testing-library/react'
import { StripedSetGrid } from '../../../src/explorations/note-grid-sets/striped-set-grid'

const notes = [
  { id: '1', title: 'one', sets: ['set-a'], tags: [] },
  { id: '2', title: 'two', sets: ['set-a', 'set-b'], tags: ['alpha', 'beta'] },
  { id: '3', title: 'three', sets: ['set-b', 'set-c', 'set-d'], tags: ['alpha'] },
]

function renderGrid(mode: 'set' | 'tag') {
  render(<StripedSetGrid notes={notes} mode={mode} width={60} height={60} />)
  const svg = screen.getByRole('img')
  svg.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect
  return svg
}

describe('StripedSetGrid', () => {
  it('draws one stripe per set', () => {
    renderGrid('set')

    expect(document.querySelectorAll('svg rect')).toHaveLength(6)
  })

  it('draws one stripe per tag, one grey stripe without tags', () => {
    renderGrid('tag')

    expect(document.querySelectorAll('svg rect')).toHaveLength(4)
    expect((document.querySelector('.note-square') as SVGElement).style.fill).toBe('var(--note-24)')
  })

  it('names the hovered note with its sets or tags', () => {
    const svg = renderGrid('set')

    fireEvent.pointerMove(svg, { clientX: 1, clientY: 1 })

    expect(screen.getByRole('tooltip')).toHaveTextContent('one: set-a')
    expect(document.querySelector('.note-hover')).not.toBeNull()
  })

  it('says when a hovered note has no tags', () => {
    const svg = renderGrid('tag')

    fireEvent.pointerMove(svg, { clientX: 1, clientY: 1 })

    expect(screen.getByRole('tooltip')).toHaveTextContent('one: no tags')
  })

  it('lists the tags of a hovered note', () => {
    const svg = renderGrid('tag')
    const cell = Number(document.querySelector('.note-square')?.getAttribute('width'))

    fireEvent.pointerMove(svg, { clientX: cell + 1, clientY: 1 })

    expect(screen.getByRole('tooltip')).toHaveTextContent('two: alpha, beta')
  })

  it('shows no tooltip off the notes or after leaving', () => {
    const svg = renderGrid('set')

    fireEvent.pointerMove(svg, { clientX: 59, clientY: 59 })
    expect(screen.queryByRole('tooltip')).toBeNull()

    fireEvent.pointerMove(svg, { clientX: 1, clientY: 1 })
    fireEvent.pointerLeave(svg)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})
