import { render, screen } from '@testing-library/react'
import { expectLowercase } from '../lowercase'
import { Typography } from '../../src/sections/typography'

describe('Typography', () => {
  it('shows its section', () => {
    const { container } = render(<Typography />)

    expect(screen.getByRole('heading', { level: 2, name: 'typography' })).toBeInTheDocument()
    expect(screen.getByText('regular 400')).toBeInTheDocument()
    expect(screen.getByText('bold 700')).toBeInTheDocument()
    expectLowercase(container)
  })
})
