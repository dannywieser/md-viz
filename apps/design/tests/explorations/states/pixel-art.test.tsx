import { render } from '@testing-library/react'
import { PixelArt } from '../../../src/explorations/states/pixel-art'

describe('PixelArt', () => {
  it('draws a square per filled cell, hidden from assistive tech', () => {
    const { container } = render(<PixelArt rows={['#+.', '..#']} cell={4} />)
    const svg = container.querySelector('svg')!

    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('width', '12')
    expect(svg).toHaveAttribute('height', '8')
    const rects = svg.querySelectorAll('rect')
    expect(rects).toHaveLength(3)
    expect(rects[0]).toHaveAttribute('fill', 'var(--foreground)')
    expect(rects[1]).toHaveAttribute('fill', 'var(--primary)')
  })

  it('uses the given accent', () => {
    const { container } = render(<PixelArt rows={['+']} accent="red" />)

    expect(container.querySelector('rect')).toHaveAttribute('fill', 'red')
  })

  it('colours filled cells like the note grid, a colour per row, and leaves the accent alone', () => {
    const { container } = render(<PixelArt rows={['##', '#+']} notePalette="fill" />)
    const rects = container.querySelectorAll('rect')

    expect([...rects].slice(0, 3).map((rect) => rect.getAttribute('data-color'))).toEqual([
      '0',
      '0',
      '1',
    ])
    expect(rects[0]).toHaveClass('note-square')
    expect(rects[0]).not.toHaveAttribute('fill')
    expect(rects[3]).toHaveAttribute('fill', 'var(--primary)')
  })

  it('colours the accent cells, a colour per row, when the palette is on the accent', () => {
    const { container } = render(<PixelArt rows={['#+', '+#']} notePalette="accent" />)
    const rects = [...container.querySelectorAll('rect')]

    expect(rects.map((rect) => rect.getAttribute('data-color'))).toEqual([null, '0', '1', null])
    expect(rects[0]).toHaveAttribute('fill', 'var(--foreground)')
  })

  it('draws nothing for no rows', () => {
    const { container } = render(<PixelArt rows={[]} />)

    expect(container.querySelectorAll('rect')).toHaveLength(0)
  })
})
