import { render, screen } from '@testing-library/react'
import { Iteration6 } from '../../../src/explorations/note-grid-sets/iteration-6'

vi.mock('../../../src/explorations/note-grid-sets/flow-section', () => ({
  FlowSection: () => <p>flow</p>,
}))

describe('Iteration6', () => {
  it('shows the flow section', () => {
    render(<Iteration6 />)

    expect(screen.getByText('flow')).toBeInTheDocument()
  })
})
