import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ExplorationsIndex } from '../../src/explorations/explorations-index'

vi.mock('../../src/explorations/registry', () => ({
  explorations: [
    { slug: 'one', title: 'first', description: 'the first one', Page: vi.fn() },
    { slug: 'two', title: 'second', description: 'the second one', Page: vi.fn() },
  ],
}))

describe('ExplorationsIndex', () => {
  it('links to every exploration with its title and description', () => {
    render(
      <MemoryRouter>
        <ExplorationsIndex />
      </MemoryRouter>,
    )

    const first = screen.getByRole('link', { name: /first/ })
    expect(first).toHaveAttribute('href', '/explorations/one')
    expect(first).toHaveTextContent('the first one')
    expect(screen.getByRole('link', { name: /second/ })).toHaveAttribute(
      'href',
      '/explorations/two',
    )
  })

  it('has a heading', () => {
    render(
      <MemoryRouter>
        <ExplorationsIndex />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'explorations' })).toBeInTheDocument()
  })
})
