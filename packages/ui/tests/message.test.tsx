import { render, screen } from '@testing-library/react'
import { Message } from '../src'

describe('Message', () => {
  it('shows its text lowercased, as muted text', () => {
    render(<Message>Loading Notes</Message>)

    const text = screen.getByText('loading notes')
    expect(text).toHaveClass('text-muted-foreground')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('announces an error as an alert in the destructive color', () => {
    render(<Message tone="error">Not A Directory</Message>)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('not a directory')
    expect(alert).toHaveClass('text-destructive')
  })

  it('shows an action under the text', () => {
    render(<Message action={<a href="/back">back</a>}>gone</Message>)

    expect(screen.getByRole('link', { name: 'back' })).toHaveAttribute('href', '/back')
  })

  it('is a card by itself, or centred in its container when it fills', () => {
    const alone = render(<Message>one</Message>)
    expect(alone.container.firstElementChild).toHaveAttribute('data-slot', 'card')

    const filling = render(<Message fill>two</Message>)
    const wrapper = filling.container.firstElementChild
    expect(wrapper).toHaveClass('h-full', 'items-center', 'justify-center')
    expect(wrapper?.querySelector('[data-slot="card"]')).toBeInTheDocument()
  })
})
