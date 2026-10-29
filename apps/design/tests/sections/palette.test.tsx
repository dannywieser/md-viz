import { render, screen } from '@testing-library/react'
import { expectLowercase } from '../lowercase'
import { Palette } from '../../src/sections/palette'

describe('Palette', () => {
  it('shows its section', () => {
    const { container } = render(<Palette />)

    expect(screen.getByRole('heading', { level: 2, name: 'color' })).toBeInTheDocument()
    expect(screen.getByText('--sol-base03')).toBeInTheDocument()
    expect(screen.getByText('--background')).toBeInTheDocument()
    expect(screen.getByText('--focus')).toBeInTheDocument()
    expect(screen.getByText('--shadow-color')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'note colors' })).toBeInTheDocument()
    expect(screen.getByText('--note-0')).toBeInTheDocument()
    expect(screen.getByText('--note-24')).toBeInTheDocument()
    expect(screen.getByText('untagged')).toBeInTheDocument()
    expectLowercase(container)
  })
})
