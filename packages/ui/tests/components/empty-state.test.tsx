import { render, screen } from '@testing-library/react'
import { EmptyState } from '../../src'

describe('EmptyState', () => {
  it('shows a ghost and a whimsical line by default', () => {
    const { container } = render(<EmptyState />)

    expect(container.querySelector('[data-slot="pixel-icon"]')).toBeInTheDocument()
    expect(screen.getByText('the notes went out for coffee')).toBeInTheDocument()
  })

  it('shows its own text lowercased', () => {
    render(<EmptyState>Nothing Here</EmptyState>)

    expect(screen.getByText('nothing here')).toBeInTheDocument()
  })

  it('is a small ghost without text when compact', () => {
    const { container } = render(<EmptyState compact>ignored</EmptyState>)
    const icon = container.querySelector('[data-slot="pixel-icon"]')

    expect(icon).toBeInTheDocument()
    expect(icon?.getAttribute('width')).toBe('48')
    expect(container).not.toHaveTextContent(/\S/)
    expect(container.querySelector('[data-slot="empty-state"]')).toHaveClass('opacity-50')
  })
})
