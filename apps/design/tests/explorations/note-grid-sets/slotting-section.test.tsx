import { fireEvent, render, screen } from '@testing-library/react'
import { SlottingSection } from '../../../src/explorations/note-grid-sets/slotting-section'

describe('SlottingSection', () => {
  it('shows the container and the shape of every set', () => {
    render(<SlottingSection />)

    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByText(/^set a: 120 notes, \d+ x \d+/)).toBeInTheDocument()
    expect(screen.getByText(/squares of \d+px, \d+ empty/)).toBeInTheDocument()
  })

  it('re-slots the sets in another container', () => {
    render(<SlottingSection />)
    const before = screen.getByRole('img').getAttribute('aria-label')

    fireEvent.click(screen.getByRole('button', { name: 'tall' }))

    expect(screen.getByRole('img').getAttribute('aria-label')).not.toBe(before)
  })

  it('switches the group outline', () => {
    render(<SlottingSection />)
    expect(document.querySelectorAll('g > path')).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: 'with outline' }))

    expect(document.querySelectorAll('g > path')).toHaveLength(7)
  })
})
