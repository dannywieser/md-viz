import { fireEvent, render, screen } from '@testing-library/react'
import { ColourSection } from '../../../src/explorations/note-grid-sets/colour-section'

describe('ColourSection', () => {
  it('starts coloured by set with the sets in the legend', () => {
    render(<ColourSection />)

    expect(screen.getByRole('img', { name: '219 notes coloured by set' })).toBeInTheDocument()
    expect(screen.getByText('set a')).toBeInTheDocument()
    expect(screen.queryByText('alpha')).toBeNull()
  })

  it('switches to tags and their legend', () => {
    render(<ColourSection />)

    fireEvent.click(screen.getByRole('button', { name: 'by tag' }))

    expect(screen.getByRole('img', { name: '219 notes coloured by tag' })).toBeInTheDocument()
    expect(screen.getByText('alpha')).toBeInTheDocument()
    expect(screen.queryByText('set a')).toBeNull()
  })
})
