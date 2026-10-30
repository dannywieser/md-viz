import { fireEvent, render, screen } from '@testing-library/react'
import { ScaledSection } from '../../../src/explorations/note-grid-sets/scaled-section'

describe('ScaledSection', () => {
  it('lists what every set got', () => {
    render(<ScaledSection />)

    expect(screen.getAllByRole('listitem')).toHaveLength(7)
    expect(screen.getByText(/^set a: \d+ notes/)).toBeInTheDocument()
  })

  it('shows more notes and another share', () => {
    render(<ScaledSection />)

    fireEvent.click(screen.getByRole('button', { name: '500' }))
    fireEvent.click(screen.getByRole('button', { name: 'even' }))

    expect(screen.getByText('7 sets, 500 notes')).toBeInTheDocument()
    expect(screen.getByText(/^set a: 2\d\d notes/)).toBeInTheDocument()
  })

  it('re-slots in another container', () => {
    render(<ScaledSection />)
    const before = screen.getByRole('img').getAttribute('aria-label')

    fireEvent.click(screen.getByRole('button', { name: 'tall' }))

    expect(screen.getByRole('img').getAttribute('aria-label')).not.toBe(before)
  })
})
