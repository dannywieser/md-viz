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

const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
/** the colour as CIE Lab, to measure how different two colours look. */
const lab = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => linear(parseInt(hex.slice(i, i + 2), 16) / 255))
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047)
  const y = f(0.2126 * r + 0.7152 * g + 0.0722 * b)
  const z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883)
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}
const distance = (a: string, b: string) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]))

describe('focus rings', () => {
  it('keeps solarized black, as the app has today', () => {
    expect(candidateThemes[0].ui.focus).toBe('#000000')
  })

  it.each(candidateThemes.filter((theme) => theme.ui.background.startsWith('#')))(
    '$id has a focus colour of at least 3:1 against its background and card',
    ({ ui }) => {
      expect(contrast(ui.focus, ui.background)).toBeGreaterThanOrEqual(3)
      expect(contrast(ui.focus, ui.card)).toBeGreaterThanOrEqual(3)
    },
  )

  it.each(candidateThemes)('$id has a focus colour that differs from its primary', ({ ui }) => {
    expect(distance(ui.focus, ui.primary)).toBeGreaterThanOrEqual(35)
  })
})

describe('shadows', () => {
  const shadow = (id: string) => candidateThemes.find((theme) => theme.id === id)!.ui.shadow

  it('is black, as the app has today, on the light pages', () => {
    expect(shadow('solarized')).toBe('#000000')
    expect(shadow('nord-light')).toBe('#000000')
  })

  it.each(candidateThemes)('$id has a shadow of at least 2:1 against its page', ({ ui }) => {
    expect(contrast(ui.shadow, ui.background)).toBeGreaterThanOrEqual(2)
  })
})
