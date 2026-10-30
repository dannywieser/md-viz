import { render } from '@testing-library/react'
import { NoteGridSquares } from '../../src/components/note-grid-squares'

const squares = [
  { x: 0, y: 0, size: 10 },
  { x: 10, y: 0, size: 20 },
]

const renderSquares = (animated: boolean) =>
  render(
    <svg>
      <NoteGridSquares squares={squares} colors={[3, 24]} animated={animated} />
    </svg>,
  )

describe('NoteGridSquares', () => {
  it('draws one rect per note at its place, in its colour', () => {
    const { container } = renderSquares(true)
    const rects = container.querySelectorAll('rect')

    expect(rects).toHaveLength(2)
    expect(rects[0].style.transform).toBe('translate(0px, 0px)')
    expect(rects[1].style.transform).toBe('translate(10px, 0px)')
    expect(rects[1].getAttribute('width')).toBe('20')
    expect(rects[0].style.fill).toBe('var(--note-3)')
    expect(rects[1].style.fill).toBe('var(--note-24)')
  })

  it('moves the squares with a transition when animated', () => {
    const { container } = renderSquares(true)

    expect((container.querySelector('rect') as SVGRectElement).style.transition).toContain(
      'transform',
    )
  })

  it('has no transition when not animated', () => {
    const { container } = renderSquares(false)

    expect((container.querySelector('rect') as SVGRectElement).style.transition).toBe('')
  })
})
