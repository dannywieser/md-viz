import { render, screen } from '@testing-library/react'
import { LegendStrip } from '../../../src/explorations/note-grid-sets/legend-strip'

const items = [
  { key: 'a', label: 'set a', count: 50, color: 0 },
  { key: 'b', label: 'set b', color: 1 },
]

describe('LegendStrip', () => {
  it('lists the items with their counts', () => {
    render(<LegendStrip items={items} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('set a')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('colours the swatches with the palette', () => {
    const { container } = render(<LegendStrip items={items} />)

    expect(container.querySelector('span[aria-hidden]')).toHaveStyle({
      backgroundColor: 'var(--note-0)',
    })
  })

  it('can lay out in a column', () => {
    render(<LegendStrip items={items} vertical />)

    expect(screen.getByRole('list')).toHaveClass('flex-col')
  })
})
