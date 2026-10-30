import { render, screen } from '@testing-library/react'
import { Iteration5 } from '../../../src/explorations/note-grid-sets/iteration-5'

vi.mock('../../../src/explorations/note-grid-sets/scaled-section', () => ({
  ScaledSection: () => <p>scaled</p>,
}))

describe('Iteration5', () => {
  it('shows the scaled section', () => {
    render(<Iteration5 />)

    expect(screen.getByText('scaled')).toBeInTheDocument()
  })
})
