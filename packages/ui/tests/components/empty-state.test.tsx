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
})
