import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ComponentsLayout } from '../../src/component-pages/components-layout'

vi.mock('../../src/component-pages/registry', () => ({
  components: [
    { slug: 'one', title: 'first', Page: vi.fn() },
    { slug: 'two', title: 'second', Page: vi.fn() },
  ],
}))

describe('ComponentsLayout', () => {
  it('lists the components and shows the chosen page beside them', () => {
    render(
      <MemoryRouter initialEntries={['/components/two']}>
        <Routes>
          <Route path="components" element={<ComponentsLayout />}>
            <Route path=":slug" element={<p>the page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'first' })).toHaveAttribute('href', '/components/one')
    expect(screen.getByRole('link', { name: 'second' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'first' })).not.toHaveAttribute('aria-current')
    expect(screen.getByText('the page')).toBeInTheDocument()
  })
})
