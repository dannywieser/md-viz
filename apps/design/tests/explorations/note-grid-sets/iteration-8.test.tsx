import { render, screen } from '@testing-library/react'
import { Iteration8 } from '../../../src/explorations/note-grid-sets/iteration-8'

vi.mock('../../../src/explorations/note-grid-sets/state-section', () => ({
  StateSection: () => <p>states</p>,
}))

describe('Iteration8', () => {
  it('shows the state section', () => {
    render(<Iteration8 />)

    expect(screen.getByText('states')).toBeInTheDocument()
  })
})
