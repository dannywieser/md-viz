import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ErrorStatePage } from '../../src/component-pages/error-state-page'
import { expectLowercase } from '../lowercase'

describe('ErrorStatePage', () => {
  it('shows its heading and demos', () => {
    const { container } = render(
      <MemoryRouter>
        <ErrorStatePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'error state' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('alert')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'try again' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'all components' })).toHaveAttribute(
      'href',
      '/components',
    )
    expectLowercase(container)
  })
})
