import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ComponentRoute } from '../../src/component-pages/component-route'

vi.mock('../../src/component-pages/registry', () => ({
  findComponent: (slug: string) =>
    slug === 'one' ? { slug: 'one', title: 'first', Page: () => <p>first page</p> } : undefined,
}))

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="components/:slug" element={<ComponentRoute />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ComponentRoute', () => {
  it('shows the page of the slug', () => {
    renderAt('/components/one')

    expect(screen.getByText('first page')).toBeInTheDocument()
  })

  it('shows the not-found card for an unknown slug', () => {
    renderAt('/components/nope')

    expect(screen.getByRole('alert')).toHaveTextContent('no such component')
    expect(screen.getByRole('link', { name: 'all components' })).toHaveAttribute(
      'href',
      '/components',
    )
  })
})
