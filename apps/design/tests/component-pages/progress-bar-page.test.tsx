import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ProgressBarPage } from '../../src/component-pages/progress-bar-page'
import { expectLowercase } from '../lowercase'

describe('ProgressBarPage', () => {
  it('shows its heading and demos', () => {
    const { container } = render(
      <MemoryRouter>
        <ProgressBarPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'progress bar' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0)
    expect(screen.getByRole('progressbar', { name: '60 of 100' })).toHaveAttribute(
      'aria-valuenow',
      '60',
    )
    expect(screen.getByRole('progressbar', { name: 'nothing to do' })).toBeInTheDocument()
    expectLowercase(container)
  })
})
