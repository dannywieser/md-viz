import { render } from '@testing-library/react'
import { NoteBlock } from '../../src/routes/note-block'

describe('NoteBlock', () => {
  it('draws columns x rows squares of the cell size, hidden from assistive tech', () => {
    const { container } = render(<NoteBlock mode="light" cell={10} columns={4} rows={3} />)
    const block = container.firstElementChild as HTMLElement

    expect(block).toHaveAttribute('aria-hidden', 'true')
    expect(block.style.gridTemplateColumns).toBe('repeat(4, 10px)')
    expect(block.children).toHaveLength(12)
    expect(block.children[0]).toHaveStyle({ width: '10px', height: '10px' })
  })
})
