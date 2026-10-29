import { render, screen } from '@testing-library/react'
import { Iteration1 } from '../../../src/explorations/note-grid-sets/iteration-1'

vi.mock('../../../src/explorations/note-grid-sets/sizing-section', () => ({
  SizingSection: () => <p>sizing</p>,
}))
vi.mock('../../../src/explorations/note-grid-sets/grouping-section', () => ({
  GroupingSection: () => <p>grouping</p>,
}))
vi.mock('../../../src/explorations/note-grid-sets/colour-section', () => ({
  ColourSection: () => <p>colour</p>,
}))
vi.mock('../../../src/explorations/note-grid-sets/labels-section', () => ({
  LabelsSection: () => <p>labels</p>,
}))

describe('Iteration1', () => {
  it('shows the four sections in order', () => {
    const { container } = render(<Iteration1 />)

    expect(
      screen.getAllByText(/^(sizing|grouping|colour|labels)$/).map((e) => e.textContent),
    ).toEqual(['sizing', 'grouping', 'colour', 'labels'])
    expect(container.children).toHaveLength(4)
  })
})
