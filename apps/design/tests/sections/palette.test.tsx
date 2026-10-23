import { render, screen } from '@testing-library/react'
import { expectLowercase } from '../lowercase'
import { Palette } from '../../src/sections/palette'

describe('Palette', () => {
  it('shows its section', () => {
    const { container } = render(<Palette />)

    expect(screen.getByRole('heading', { level: 2, name: 'color' })).toBeInTheDocument()
    expect(screen.getByText('--sol-base03')).toBeInTheDocument()
    expect(screen.getByText('--background')).toBeInTheDocument()
    expectLowercase(container)
  })
})
