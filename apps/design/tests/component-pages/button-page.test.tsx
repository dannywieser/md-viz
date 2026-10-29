import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ButtonPage } from '../../src/component-pages/button-page'
import { expectLowercase } from '../lowercase'

describe('ButtonPage', () => {
  it('shows its heading and demos', () => {
    const { container } = render(
      <MemoryRouter>
        <ButtonPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'button' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'destructive lg' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ghost' })).toBeDisabled()
    expectLowercase(container)
  })
})
