import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { StateBlockPage } from '../../src/component-pages/state-block-page'
import { expectLowercase } from '../lowercase'

describe('StateBlockPage', () => {
  it('shows its heading and demos', () => {
    const { container } = render(
      <MemoryRouter>
        <StateBlockPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'state block' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0)
    expect(container.querySelectorAll('[data-slot="state-block"]')).toHaveLength(4)
    expectLowercase(container)
  })
})
