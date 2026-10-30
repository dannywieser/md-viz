import { render, screen } from '@testing-library/react'
import { Iteration4 } from '../../../src/explorations/note-grid-sets/iteration-4'

vi.mock('../../../src/explorations/note-grid-sets/bar-slotting-section', () => ({
  BarSlottingSection: () => <p>bar</p>,
}))

describe('Iteration4', () => {
  it('shows the bar slotting section', () => {
    render(<Iteration4 />)

    expect(screen.getByText('bar')).toBeInTheDocument()
  })
})
