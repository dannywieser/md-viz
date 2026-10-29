import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AppHeaderPage } from '../../src/component-pages/app-header-page'
import { expectLowercase } from '../lowercase'

describe('AppHeaderPage', () => {
  it('shows its heading and demos', () => {
    const { container } = render(
      <MemoryRouter>
        <AppHeaderPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'app header' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('banner')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'save' })).toBeInTheDocument()
    expectLowercase(container)
  })
})
