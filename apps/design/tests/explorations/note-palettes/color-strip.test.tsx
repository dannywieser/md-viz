import { render, screen } from '@testing-library/react'
import { ColorStrip } from '../../../src/explorations/note-palettes/color-strip'

describe('ColorStrip', () => {
  it('shows a numbered square for each colour', () => {
    render(<ColorStrip colors={['#ff0000', '#00ff00', '#cccccc']} />)

    const squares = screen.getAllByRole('listitem')
    expect(squares).toHaveLength(3)
    expect(squares[1]).toHaveTextContent('1')
    expect(squares[1].style.background).toBe('rgb(0, 255, 0)')
  })
})
