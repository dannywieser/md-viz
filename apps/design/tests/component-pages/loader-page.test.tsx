import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { LoaderPage } from '../../src/component-pages/loader-page'
import { expectLowercase } from '../lowercase'

describe('LoaderPage', () => {
  it('shows its heading and demos', () => {
    const { container } = render(
      <MemoryRouter>
        <LoaderPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'loader' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0)
    expect(screen.getByRole('status', { name: 'loading notes' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'loading at 12px' })).toBeInTheDocument()
    expectLowercase(container)
  })
})
