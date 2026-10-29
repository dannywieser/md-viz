import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { NotFound } from '../src/not-found'

describe('NotFound', () => {
  it('says so and links to the guidelines', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('no such page')
    expect(screen.getByRole('link', { name: 'back to the guidelines' })).toHaveAttribute(
      'href',
      '/guidelines',
    )
  })
})
