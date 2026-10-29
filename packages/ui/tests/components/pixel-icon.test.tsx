import { render } from '@testing-library/react'
import { PixelIcon } from '../../src'

describe('PixelIcon', () => {
  it('is decorative and sized by its cell', () => {
    const { container } = render(<PixelIcon name="ghost" cell={4} />)
    const svg = container.querySelector('svg')!

    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('width', '48')
    expect(svg).toHaveAttribute('height', '40')
  })

  it('fills the ghost with the note palette, a colour per row, leaving the eyes empty', () => {
    const { container } = render(<PixelIcon name="ghost" />)
    const squares = [...container.querySelectorAll('rect')]

    expect(squares.every((rect) => rect.classList.contains('note-square'))).toBe(true)
    expect(squares[0]).toHaveAttribute('data-color', '0')
    // the ghost has ten rows and the icon cycles through the eight full hues
    expect(squares.at(-1)).toHaveAttribute('data-color', '1')
    expect(
      squares.some((rect) => rect.getAttribute('x') === '3' && rect.getAttribute('y') === '3'),
    ).toBe(false)
  })

  it('colours only the crack of the broken tile', () => {
    const { container } = render(<PixelIcon name="broken-tile" />)
    const cracks = container.querySelectorAll('.note-square')
    const body = container.querySelectorAll('rect[fill="var(--foreground)"]')

    expect(cracks).toHaveLength(12)
    expect(body).toHaveLength(12 * 11)
  })
})
