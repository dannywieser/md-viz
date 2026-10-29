import { fireEvent, render, screen } from '@testing-library/react'
import { LabelsSection } from '../../../src/explorations/note-grid-sets/labels-section'

describe('LabelsSection', () => {
  it('shows every treatment', () => {
    render(<LabelsSection />)

    for (const name of [
      'chip inside the block',
      'tab on the top edge',
      'always visible once it fits',
      'legend beside the grid',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
    expect(screen.getAllByRole('img')).toHaveLength(4)
  })

  it('has a legend of the sets next to the unlabelled grid', () => {
    render(<LabelsSection />)

    expect(screen.getAllByRole('listitem')).toHaveLength(7)
  })

  it('switches the grid size', () => {
    render(<LabelsSection />)
    const before = screen.getAllByRole('img')[0].getAttribute('width')

    fireEvent.click(screen.getByRole('button', { name: 'small' }))

    expect(screen.getAllByRole('img')[0].getAttribute('width')).not.toBe(before)
    expect(screen.getByRole('button', { name: 'small' })).toHaveAttribute('aria-pressed', 'true')
  })
})
