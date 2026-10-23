import { render, screen } from '@testing-library/react'
import { expectLowercase } from '../lowercase'
import { Grid } from '../../src/sections/grid'

describe('Grid', () => {
  it('shows its section', () => {
    const { container } = render(<Grid />)

    expect(screen.getByRole('heading', { level: 2, name: 'grid' })).toBeInTheDocument()
    expect(screen.getByText('--grid-size')).toBeInTheDocument()
    expect(screen.getByText('--grid-dot')).toBeInTheDocument()
    expectLowercase(container)
  })
})
