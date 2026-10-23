import { render, screen } from '@testing-library/react'
import { ErrorCard } from '../../src/renderer/src/error-card'

describe('ErrorCard', () => {
  it('shows the message as a lowercase alert', () => {
    render(<ErrorCard message="Not A Directory" />)

    expect(screen.getByRole('alert')).toHaveTextContent('not a directory')
  })
})
