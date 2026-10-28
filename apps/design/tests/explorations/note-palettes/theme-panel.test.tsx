import { render, screen } from '@testing-library/react'
import {
  candidateThemes,
  type CandidateTheme,
} from '../../../src/explorations/note-palettes/candidate-themes'
import { ThemePanel } from '../../../src/explorations/note-palettes/theme-panel'

const find = (id: string): CandidateTheme => candidateThemes.find((theme) => theme.id === id)!

describe('ThemePanel', () => {
  it('shows the theme with its note colours and grids at four cell sizes', () => {
    render(<ThemePanel theme={find('gruvbox')} mode="light" />)

    expect(screen.getByRole('heading', { name: 'gruvbox' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(25)
    for (const cell of [3, 4, 6, 12]) {
      expect(screen.getByRole('img', { name: `168 notes, ${cell}px squares` })).toBeInTheDocument()
    }
  })

  it('sets the variant of the mode on the panel', () => {
    const { rerender } = render(<ThemePanel theme={find('gruvbox')} mode="light" />)
    expect(screen.getByRole('region', { name: 'gruvbox' })).toHaveStyle({
      '--background': '#fbf1c7',
    })

    rerender(<ThemePanel theme={find('gruvbox')} mode="dark" />)
    expect(screen.getByRole('region', { name: 'gruvbox' })).toHaveStyle({
      '--background': '#282828',
    })
  })

  it('says when a theme has only one mode', () => {
    const { rerender } = render(<ThemePanel theme={find('dracula')} mode="light" />)
    expect(screen.getByText('dark only')).toBeInTheDocument()

    rerender(<ThemePanel theme={find('high-contrast')} mode="dark" />)
    expect(screen.getByText('light only')).toBeInTheDocument()
  })

  it('says nothing for a theme with both modes', () => {
    render(<ThemePanel theme={find('nord')} mode="dark" />)

    expect(screen.queryByText(/(light|dark) only/)).not.toBeInTheDocument()
  })
})
