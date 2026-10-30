import { fireEvent, render, screen } from '@testing-library/react'
import { TileSection } from '../../../src/explorations/note-grid-sets/tile-section'

describe('TileSection', () => {
  it('fills the grid with the notes and lists the square size of each set', () => {
    render(<TileSection />)

    expect(screen.getByText('7 sets, 100 notes')).toBeInTheDocument()
    expect(document.querySelectorAll('svg rect')).toHaveLength(100)
    expect(screen.getAllByRole('listitem')).toHaveLength(7)
  })

  it('shows more notes, another container and another share', () => {
    render(<TileSection />)
    const before = screen.getByRole('img').getAttribute('aria-label')

    fireEvent.click(screen.getByRole('button', { name: '500' }))
    fireEvent.click(screen.getByRole('button', { name: 'tall' }))
    fireEvent.click(screen.getByRole('button', { name: 'even' }))

    expect(document.querySelectorAll('svg rect')).toHaveLength(500)
    expect(screen.getByRole('img').getAttribute('aria-label')).not.toBe(before)
  })
})
