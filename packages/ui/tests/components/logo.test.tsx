import { render, screen } from '@testing-library/react'
import { Logo } from '../../src'
import { layoutPixels } from '../../src/lib/pixel-glyphs'

describe('Logo', () => {
  it('is an image named after the app, with square pixels', () => {
    render(<Logo />)

    const logo = screen.getByRole('img', { name: 'md-viz' })
    expect(logo).toHaveAttribute('shape-rendering', 'crispEdges')
    // one rect per lit cell plus the tile
    expect(logo.querySelectorAll('rect')).toHaveLength(layoutPixels('.md').rects.length + 1)
  })

  it('scales with the cell size', () => {
    render(<Logo cell={2} />)

    expect(screen.getByRole('img')).toHaveAttribute('width', '32')
  })
})
