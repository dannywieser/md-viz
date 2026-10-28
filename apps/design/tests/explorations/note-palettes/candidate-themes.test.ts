import { candidateThemes } from '../../../src/explorations/note-palettes/candidate-themes'
import { HUE_NAMES } from '../../../src/explorations/note-palettes/derive-note-colors'

describe('candidate themes', () => {
  it('lists every look as its own theme', () => {
    expect(candidateThemes.map((theme) => theme.id)).toEqual([
      'solarized',
      'gruvbox-dark',
      'nord-dark',
      'nord-light',
      'catppuccin-mocha',
      'catppuccin-latte',
      'dracula',
      'gotham',
      'ocean',
      'high-contrast',
    ])
  })

  it('has solarized as the light look the app has today, with orange buttons', () => {
    const solarized = candidateThemes[0]

    expect(solarized.ui.background).toBe('#fdf6e3')
    expect(solarized.ui.card).toBe('#ffffff')
    expect(solarized.ui.primary).toBe('#cb4b16')
  })

  it('gives every theme all eight hues', () => {
    for (const theme of candidateThemes) {
      expect(Object.keys(theme.hues).sort()).toEqual([...HUE_NAMES].sort())
    }
  })
})

describe('focus rings', () => {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const contrast = (a: string, b: string) => {
    const [high, low] = [lum(a), lum(b)].sort((x, y) => y - x)
    return (high + 0.05) / (low + 0.05)
  }

  it('keeps solarized blue, as the app has today', () => {
    expect(candidateThemes[0].ui.ring).toBe('#268bd2')
  })

  it.each(candidateThemes.filter((theme) => theme.ui.background.startsWith('#')))(
    '$id has a ring of at least 3:1 against its background and card',
    ({ ui }) => {
      expect(contrast(ui.ring, ui.background)).toBeGreaterThanOrEqual(3)
      expect(contrast(ui.ring, ui.card)).toBeGreaterThanOrEqual(3)
    },
  )
})
