import { render, screen, within } from '@testing-library/react'
import { findTheme } from '@md-viz/ui'
import { ThemeRow } from '../../src/sections/theme-row'

const gotham = findTheme('gotham')

describe('ThemeRow', () => {
  it('names the theme', () => {
    render(<ThemeRow theme={gotham} />)

    expect(screen.getByRole('heading', { level: 3, name: 'gotham' })).toBeInTheDocument()
  })

  it('shows the ui roles and the 25 note colors', () => {
    render(<ThemeRow theme={gotham} />)

    const roles = within(screen.getByRole('list', { name: 'ui roles' })).getAllByRole('listitem')
    expect(roles).toHaveLength(10)
    expect(roles[0]).toHaveAttribute('title', `background ${gotham.ui.background}`)
    expect(roles.at(-1)).toHaveAttribute('title', `shadow ${gotham.ui.shadow}`)
    expect(
      within(screen.getByRole('list', { name: 'note colors' })).getAllByRole('listitem'),
    ).toHaveLength(25)
  })
})
