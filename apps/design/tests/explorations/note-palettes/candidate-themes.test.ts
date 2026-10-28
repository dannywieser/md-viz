import { candidateThemes, variantFor } from '../../../src/explorations/note-palettes/candidate-themes'
import type { CandidateTheme } from '../../../src/explorations/note-palettes/candidate-themes'

const find = (id: string) => candidateThemes.find((theme) => theme.id === id)!

describe('candidate themes', () => {
  it('has the eight mdm themes', () => {
    expect(candidateThemes.map((theme) => theme.id)).toEqual([
      'solarized',
      'gruvbox',
      'nord',
      'catppuccin',
      'dracula',
      'gotham',
      'ocean',
      'high-contrast',
    ])
  })

  it('picks the variant of the mode', () => {
    const gruvbox = find('gruvbox')

    expect(variantFor(gruvbox, 'dark')).toBe(gruvbox.dark)
    expect(variantFor(gruvbox, 'light')).toBe(gruvbox.light)
  })

  it('falls back to the one variant a theme has', () => {
    expect(variantFor(find('dracula'), 'light')).toBe(find('dracula').dark)
    expect(variantFor(find('high-contrast'), 'dark')).toBe(find('high-contrast').light)
  })

  it('throws for a theme without variants', () => {
    const empty: CandidateTheme = { id: 'empty', name: 'empty', source: '' }

    expect(() => variantFor(empty, 'light')).toThrow('theme empty has no variant')
  })
})
