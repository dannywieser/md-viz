import { render } from '@testing-library/react'
import { ThemeSwatch } from '../../src/components/theme-swatch'
import { HUE_ORDER } from '../../src/lib/note-colors'
import { themes } from '../../src/lib/themes'

describe('ThemeSwatch', () => {
  it('draws the eight hues around the background, decoratively', () => {
    const { container } = render(<ThemeSwatch theme={themes[0]} />)

    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    const fills = [...container.querySelectorAll('rect')].map((rect) => rect.getAttribute('fill'))
    expect(fills).toHaveLength(9)
    expect(fills[4]).toBe(themes[0].ui.background)
    expect([...fills.slice(0, 4), ...fills.slice(5)]).toEqual(
      HUE_ORDER.map((hue) => themes[0].hues[hue]),
    )
  })

  it('is three cells wide, 5px a cell unless told otherwise', () => {
    const { container, rerender } = render(<ThemeSwatch theme={themes[0]} />)
    expect(container.querySelector('svg')).toHaveAttribute('width', '15')

    rerender(<ThemeSwatch theme={themes[0]} cell={4} />)
    expect(container.querySelector('svg')).toHaveAttribute('width', '12')
  })
})
