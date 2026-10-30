import { render, screen } from '@testing-library/react'
import { Iteration3 } from '../../../src/explorations/note-grid-sets/iteration-3'

vi.mock('../../../src/explorations/note-grid-sets/labelled-slotting-section', () => ({
  LabelledSlottingSection: () => <p>labelled</p>,
}))

describe('Iteration3', () => {
  it('shows the labelled slotting section', () => {
    render(<Iteration3 />)

    expect(screen.getByText('labelled')).toBeInTheDocument()
  })
})
