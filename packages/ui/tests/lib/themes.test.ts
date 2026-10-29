import { HUE_ORDER } from '../../src/lib/note-colors'
import { DEFAULT_THEME_ID, findTheme, themes } from '../../src/lib/themes'

describe('themes', () => {
  it('has the nine final themes, solarized first', () => {
    expect(themes.map((theme) => theme.id)).toEqual([
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
    expect(DEFAULT_THEME_ID).toBe('solarized')
  })

  it('has solarized as the light look the app has today', () => {
    const { ui } = findTheme('solarized')

    expect(ui.background).toBe('#fdf6e3')
    expect(ui.card).toBe('#ffffff')
    expect(ui.primary).toBe('#cb4b16')
    expect(ui.focus).toBe('#000000')
    expect(ui.shadow).toBe('#000000')
  })

  it('gives every theme all its hues', () => {
    for (const theme of themes) {
      expect(Object.keys(theme.hues).sort()).toEqual([...HUE_ORDER].sort())
    }
  })

  it('finds a theme by id and falls back to the default', () => {
    expect(findTheme('gotham').id).toBe('gotham')
    expect(findTheme('nope').id).toBe('solarized')
    expect(findTheme(null).id).toBe('solarized')
    expect(findTheme(undefined).id).toBe('solarized')
  })
})
