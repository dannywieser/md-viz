import { render, screen } from '@testing-library/react'
import { expectLowercase } from '../lowercase'
import { Spacing } from '../../src/sections/spacing'

describe('Spacing', () => {
  it('shows its section', () => {
    const { container } = render(<Spacing />)

    expect(screen.getByRole('heading', { level: 2, name: 'spacing' })).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expectLowercase(container)
  })
})
