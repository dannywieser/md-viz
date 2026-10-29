import { render, screen } from '@testing-library/react'
import { Iteration2 } from '../../../src/explorations/note-grid-sets/iteration-2'

vi.mock('../../../src/explorations/note-grid-sets/slotting-section', () => ({
  SlottingSection: () => <p>slotting</p>,
}))

describe('Iteration2', () => {
  it('shows the slotting section', () => {
    render(<Iteration2 />)

    expect(screen.getByText('slotting')).toBeInTheDocument()
  })
})
