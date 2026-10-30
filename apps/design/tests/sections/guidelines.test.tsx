import { render, screen } from '@testing-library/react'
import { expectLowercase } from '../lowercase'
import { Guidelines } from '../../src/sections/guidelines'

describe('Guidelines', () => {
  it('shows its section', () => {
    const { container } = render(<Guidelines />)

    expect(screen.getByRole('heading', { level: 2, name: 'guidelines' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'lowercase text only' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'themes' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'set colors' })).toBeInTheDocument()
    expectLowercase(container)
  })
})
