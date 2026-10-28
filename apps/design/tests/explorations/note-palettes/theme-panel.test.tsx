import { render, screen } from '@testing-library/react'
import { candidateThemes } from '../../../src/explorations/note-palettes/candidate-themes'
import { ThemePanel } from '../../../src/explorations/note-palettes/theme-panel'

const nord = candidateThemes.find((theme) => theme.id === 'nord-light')!

describe('ThemePanel', () => {
  it('shows the theme with its note colours and grids at four cell sizes', () => {
    render(<ThemePanel theme={nord} />)

    expect(screen.getByRole('heading', { name: 'nord light' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(25)
    for (const cell of [3, 4, 6, 12]) {
      expect(screen.getByRole('img', { name: `168 notes, ${cell}px squares` })).toBeInTheDocument()
    }
  })

  it('sets the theme tokens on the panel', () => {
    render(<ThemePanel theme={nord} />)

    expect(screen.getByRole('region', { name: 'nord light' })).toHaveStyle({
      '--background': '#eceff4',
      '--primary': '#5e81ac',
      '--focus': '#2e3440',
      '--shadow-color': '#000000',
    })
  })
})
