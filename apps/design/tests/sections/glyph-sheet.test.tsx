import { render, screen } from '@testing-library/react'
import { GLYPHS, layoutPixels } from '@md-viz/ui/lib/pixel-glyphs'
import { GlyphSheet } from '../../src/sections/glyph-sheet'

describe('GlyphSheet', () => {
  it('draws every glyph with one rect per pixel', () => {
    render(<GlyphSheet />)

    const glyphs = screen.getAllByRole('img', { name: /^glyph / })
    expect(glyphs).toHaveLength(Object.keys(GLYPHS).length)
    for (const char of Object.keys(GLYPHS)) {
      const glyph = screen.getByRole('img', { name: `glyph ${char}` })
      expect(glyph.querySelectorAll('rect')).toHaveLength(layoutPixels(char).rects.length)
    }
  })
})
