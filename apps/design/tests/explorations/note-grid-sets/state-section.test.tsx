import { fireEvent, render, screen } from '@testing-library/react'
import { StateSection } from '../../../src/explorations/note-grid-sets/state-section'

describe('StateSection', () => {
  it('starts grouped with every note drawn', () => {
    render(<StateSection />)

    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(/^grouped/)
    expect(document.querySelectorAll('svg rect')).toHaveLength(100 + 4)
  })

  it('switches between grouped and not grouped', () => {
    render(<StateSection />)

    fireEvent.click(screen.getByRole('button', { name: 'ungroup notes' }))
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(/^not grouped/)

    fireEvent.click(screen.getByRole('button', { name: 'group notes by set' }))
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(/^grouped/)
  })

  it('shows more notes in another container', () => {
    render(<StateSection />)

    fireEvent.click(screen.getByRole('button', { name: '500' }))
    fireEvent.click(screen.getByRole('button', { name: 'tall' }))

    expect(screen.getByText('7 sets, 500 notes')).toBeInTheDocument()
  })
})
