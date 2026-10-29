import { render, screen } from '@testing-library/react'
import { SizingSection } from '../../../src/explorations/note-grid-sets/sizing-section'

describe('SizingSection', () => {
  it('shows a grid for each sizing rule', () => {
    render(<SizingSection />)

    expect(screen.getAllByRole('img')).toHaveLength(3)
    for (const rule of ['round', 'ceil', 'rectangle']) {
      expect(screen.getByRole('heading', { name: rule })).toBeInTheDocument()
    }
  })

  it('lists how a set of 50 notes becomes cells in each rule', () => {
    render(<SizingSection />)

    expect(screen.getByText('set b: 50 notes, 7 x 7 = 49 cells')).toBeInTheDocument()
    expect(screen.getByText('set b: 50 notes, 8 x 8 = 64 cells')).toBeInTheDocument()
    expect(screen.getByText('set b: 50 notes, 8 x 7 = 56 cells')).toBeInTheDocument()
  })
})
