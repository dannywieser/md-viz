import { fireEvent, render, screen } from '@testing-library/react'
import { LabelledSlottingSection } from '../../../src/explorations/note-grid-sets/labelled-slotting-section'

const names = () => [...document.querySelectorAll('[data-set-label]')].map((t) => t.textContent)

describe('LabelledSlottingSection', () => {
  it('outlines every group and names the wide ones', () => {
    render(<LabelledSlottingSection />)

    expect(document.querySelectorAll('g > path')).toHaveLength(7)
    expect(names()).toContain('set a')
    expect(names()).not.toContain('set g')
  })

  it('shows no names when off', () => {
    render(<LabelledSlottingSection />)

    fireEvent.click(screen.getByRole('button', { name: 'off' }))

    expect(names()).toEqual([])
  })

  it('shows fewer names at a higher threshold', () => {
    render(<LabelledSlottingSection />)
    const before = names().length

    fireEvent.click(screen.getByRole('button', { name: '140px' }))

    expect(names().length).toBeLessThan(before)
  })

  it('re-slots in another container', () => {
    render(<LabelledSlottingSection />)
    const before = screen.getByRole('img').getAttribute('aria-label')

    fireEvent.click(screen.getByRole('button', { name: 'tall' }))

    expect(screen.getByRole('img').getAttribute('aria-label')).not.toBe(before)
  })
})
