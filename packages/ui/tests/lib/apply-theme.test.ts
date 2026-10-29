import { applyTheme, themeVariables } from '../../src/lib/apply-theme'
import { findTheme } from '../../src/lib/themes'

const gotham = findTheme('gotham')

describe('themeVariables', () => {
  it('maps the roles to the app tokens', () => {
    const variables = themeVariables(gotham)

    expect(variables['--background']).toBe(gotham.ui.background)
    expect(variables['--foreground']).toBe(gotham.ui.text)
    expect(variables['--card']).toBe(gotham.ui.card)
    expect(variables['--primary']).toBe(gotham.ui.primary)
    expect(variables['--primary-foreground']).toBe(gotham.ui.onPrimary)
    expect(variables['--muted-foreground']).toBe(gotham.ui.muted)
    expect(variables['--focus']).toBe(gotham.ui.focus)
    expect(variables['--ring']).toBe(gotham.ui.focus)
    expect(variables['--shadow-color']).toBe(gotham.ui.shadow)
  })

  it('sets every note colour', () => {
    const variables = themeVariables(gotham)

    expect(variables['--note-0']).toBe(gotham.hues.red)
    expect(variables['--note-24']).toBe(gotham.ui.muted)
    expect(Object.keys(variables).filter((name) => name.startsWith('--note-')).length).toBe(26)
  })

  it('derives the destructive colour from the red hue', () => {
    expect(themeVariables(gotham)['--destructive']).toContain(gotham.hues.red)
  })
})

describe('applyTheme', () => {
  it('sets the variables and the theme id on the root', () => {
    const root = document.createElement('div')

    applyTheme(gotham, root)

    expect(root.style.getPropertyValue('--background')).toBe(gotham.ui.background)
    expect(root.dataset.theme).toBe('gotham')
  })

  it('applies to the page by default', () => {
    applyTheme(gotham)

    expect(document.documentElement.dataset.theme).toBe('gotham')
    document.documentElement.removeAttribute('style')
  })
})
