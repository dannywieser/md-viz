import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { CardPage } from '../../src/component-pages/card-page'
import { expectLowercase } from '../lowercase'

describe('CardPage', () => {
  it('shows its heading and demos', () => {
    const { container } = render(
      <MemoryRouter>
        <CardPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'card' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0)
    expect(screen.getByText('card title')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'action' })).toBeInTheDocument()
    expectLowercase(container)
  })
})
