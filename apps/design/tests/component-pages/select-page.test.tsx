import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { SelectPage } from '../../src/component-pages/select-page'
import { expectLowercase } from '../lowercase'

describe('SelectPage', () => {
  it('shows its heading and demos', () => {
    const { container } = render(
      <MemoryRouter>
        <SelectPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'select' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0)
    expect(screen.getByRole('combobox', { name: 'source' })).toHaveTextContent('file')
    expect(screen.getByRole('combobox', { name: 'disabled source' })).toBeDisabled()
    expectLowercase(container)
  })
})
