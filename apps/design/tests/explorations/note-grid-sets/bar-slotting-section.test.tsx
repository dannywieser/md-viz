import { fireEvent, render, screen } from '@testing-library/react'
import { BarSlottingSection } from '../../../src/explorations/note-grid-sets/bar-slotting-section'

describe('BarSlottingSection', () => {
  it('shows the totals in the bar and no names on the groups', () => {
    render(<BarSlottingSection />)

    expect(screen.getByText('7 sets, 100 notes')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-set-label]')).toHaveLength(0)
    expect(document.querySelectorAll('g > path')).toHaveLength(7)
  })

  it('re-slots in another container', () => {
    render(<BarSlottingSection />)
    const before = screen.getByRole('img').getAttribute('aria-label')

    fireEvent.click(screen.getByRole('button', { name: 'tall' }))

    expect(screen.getByRole('img').getAttribute('aria-label')).not.toBe(before)
  })

  it('shows more notes in the same space', () => {
    render(<BarSlottingSection />)
    const squares = () => document.querySelectorAll('g rect').length

    fireEvent.click(screen.getByRole('button', { name: '5000' }))

    expect(screen.getByText('7 sets, 5000 notes')).toBeInTheDocument()
    expect(squares()).toBe(5000)
  })
})
