import { fireEvent, render, screen } from '@testing-library/react'
import { GroupToggle } from '../../../src/explorations/note-grid-sets/group-toggle'

describe('GroupToggle', () => {
  it('offers to ungroup while grouped', () => {
    const onToggle = vi.fn()
    render(<GroupToggle grouped onToggle={onToggle} />)

    fireEvent.click(screen.getByRole('button', { name: 'ungroup notes' }))

    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('offers to group while not grouped', () => {
    render(<GroupToggle grouped={false} onToggle={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'group notes by set' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
