import { render, screen } from '@testing-library/react'
import { Wordmark } from '../../src'
import { layoutPixels } from '../../src/lib/pixel-glyphs'

describe('Wordmark', () => {
  it('draws a 2x2 block of squares per lit cell and colors viz with the accent', () => {
    render(<Wordmark />)

    const rects = screen.getByRole('img', { name: 'md-viz' }).querySelectorAll('rect')
    expect(rects).toHaveLength(layoutPixels('md-viz').rects.length * 4)
    const accent = [...rects].filter((r) => r.getAttribute('fill') === 'var(--primary)')
    const viz = layoutPixels('viz').rects.length
    expect(accent).toHaveLength(viz * 4)
  })

  it('contains no text, only pixels', () => {
    render(<Wordmark />)

    expect(screen.getByRole('img').textContent).toBe('')
  })
})
