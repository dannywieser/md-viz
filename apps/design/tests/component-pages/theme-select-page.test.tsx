import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { themes } from '@md-viz/ui'
import { ThemeSelectPage } from '../../src/component-pages/theme-select-page'
import { expectLowercase } from '../lowercase'

describe('ThemeSelectPage', () => {
  it('shows the pickers on the first theme', () => {
    const { container } = render(<ThemeSelectPage />)

    expect(screen.getByRole('heading', { level: 2, name: 'theme select' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'theme' })).toHaveAttribute('title', themes[0].name)
    expect(screen.getByText(themes[0].name, { selector: 'p' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(25)
    expectLowercase(container)
  })

  it('previews the chosen theme without changing the page', async () => {
    render(<ThemeSelectPage />)

    await userEvent.click(screen.getByRole('combobox', { name: 'theme' }))
    await userEvent.click(screen.getByRole('option', { name: themes[1].name }))

    expect(screen.getByText(themes[1].name, { selector: 'p' })).toBeInTheDocument()
  })
})
