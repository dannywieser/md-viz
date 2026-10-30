import { render, screen } from '@testing-library/react'
import { Iteration7 } from '../../../src/explorations/note-grid-sets/iteration-7'

vi.mock('../../../src/explorations/note-grid-sets/tile-section', () => ({
  TileSection: () => <p>tiles</p>,
}))

describe('Iteration7', () => {
  it('shows the tile section', () => {
    render(<Iteration7 />)

    expect(screen.getByText('tiles')).toBeInTheDocument()
  })
})
