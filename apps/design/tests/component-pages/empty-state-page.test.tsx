import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { EmptyStatePage } from '../../src/component-pages/empty-state-page'
import { expectLowercase } from '../lowercase'

describe('EmptyStatePage', () => {
  it('shows its heading and demos', () => {
    const { container } = render(
      <MemoryRouter>
        <EmptyStatePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'empty state' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0)
    expect(screen.getByText('the notes went out for coffee')).toBeInTheDocument()
    expect(screen.getByText('no notes in this set')).toBeInTheDocument()
    expect(container.querySelector('[data-compact]')).toBeInTheDocument()
    expectLowercase(container)
  })
})
