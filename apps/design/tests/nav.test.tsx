import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { themes } from '@md-viz/ui'
import { Nav } from '../src/nav'
import { expectLowercase } from './lowercase'

function renderNav(path = '/guidelines', onThemeChange = vi.fn()) {
  const view = render(
    <MemoryRouter initialEntries={[path]}>
      <Nav themeId={themes[0].id} themes={themes} onThemeChange={onThemeChange} />
    </MemoryRouter>,
  )
  return { ...view, onThemeChange }
}

describe('Nav', () => {
  it('links to every page', () => {
    const { container } = renderNav()

    const links = screen.getAllByRole('link').map((link) => link.getAttribute('href'))
    expect(links).toEqual([
      '/guidelines',
      '/logo',
      '/colors',
      '/typography',
      '/spacing',
      '/grid',
      '/components',
      '/explorations',
    ])
    expectLowercase(container)
  })

  it('marks the current page', () => {
    renderNav('/components/button')

    expect(screen.getByRole('link', { name: 'components' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'logo' })).not.toHaveAttribute('aria-current')
  })

  it('shows the theme and reports a change', async () => {
    const { onThemeChange } = renderNav()
    expect(screen.getByRole('combobox', { name: 'theme' })).toHaveAttribute('title', themes[0].name)

    await userEvent.click(screen.getByRole('combobox', { name: 'theme' }))
    await userEvent.click(screen.getByRole('option', { name: themes[2].name }))

    expect(onThemeChange).toHaveBeenCalledWith(themes[2].id)
  })
})
