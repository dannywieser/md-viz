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
