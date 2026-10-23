import { render, screen } from '@testing-library/react'
import { Message } from '../src/message'

describe('Message', () => {
  it('shows its text', () => {
    render(<Message>loading notes</Message>)

    expect(screen.getByText('loading notes')).toBeInTheDocument()
  })
})
