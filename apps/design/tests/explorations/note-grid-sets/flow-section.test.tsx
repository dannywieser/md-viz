import { fireEvent, render, screen } from '@testing-library/react'
import { FlowSection } from '../../../src/explorations/note-grid-sets/flow-section'

describe('FlowSection', () => {
  it('fills the grid with the notes and no filler', () => {
    render(<FlowSection />)

    expect(screen.getByText('7 sets, 100 notes')).toBeInTheDocument()
    expect(document.querySelectorAll('svg rect')).toHaveLength(100)
  })

  it('shows more notes, another container and another direction', () => {
    render(<FlowSection />)
    const before = screen.getByRole('img').getAttribute('aria-label')

    fireEvent.click(screen.getByRole('button', { name: '500' }))
    fireEvent.click(screen.getByRole('button', { name: 'tall' }))
    fireEvent.click(screen.getByRole('button', { name: 'along rows' }))

    expect(document.querySelectorAll('svg rect')).toHaveLength(500)
    expect(screen.getByRole('img').getAttribute('aria-label')).not.toBe(before)
  })
})
