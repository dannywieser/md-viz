import { render, screen } from '@testing-library/react'
import { StripedGrid } from '../../../src/explorations/note-palettes/striped-grid'

const colors = ['#ff0000', '#00ff00', '#0000ff']

describe('StripedGrid', () => {
  it('draws one stripe per colour of each note', () => {
    const { container } = render(
      <StripedGrid colors={colors} notes={[[0], [1, 2], [0, 1, 2]]} cell={6} columns={2} />,
    )

    expect(container.querySelectorAll('rect')).toHaveLength(6)
  })

  it('sizes the svg from the cell and the columns', () => {
    render(<StripedGrid colors={colors} notes={[[0], [1], [2]]} cell={6} columns={2} />)

    const svg = screen.getByRole('img', { name: '3 notes, 6px squares' })
    expect(svg).toHaveAttribute('width', '12')
    expect(svg).toHaveAttribute('height', '12')
  })

  it('stacks the stripes of a note from the top of its cell', () => {
    const { container } = render(
      <StripedGrid colors={colors} notes={[[0, 1, 2]]} cell={6} columns={1} />,
    )

    const rects = [...container.querySelectorAll('rect')]
    expect(rects.map((rect) => rect.getAttribute('y'))).toEqual(['0', '2', '4'])
    expect(rects.map((rect) => rect.getAttribute('fill'))).toEqual(colors)
  })
})
