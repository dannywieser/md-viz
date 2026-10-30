import { fireEvent, render, screen } from '@testing-library/react'
import { GroupToggle } from '../../src/components/group-toggle'

describe('GroupToggle', () => {
  it('offers to group the notes while they are not grouped', () => {
    render(<GroupToggle grouped={false} onToggle={() => {}} />)

    const button = screen.getByRole('button', { name: 'group notes by set' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('offers to ungroup them while they are grouped', () => {
    render(<GroupToggle grouped onToggle={() => {}} />)

    const button = screen.getByRole('button', { name: 'ungroup notes' })
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows a different icon for each state', () => {
    const { container, rerender } = render(<GroupToggle grouped={false} onToggle={() => {}} />)
    const before = container.querySelector('svg')?.innerHTML
    rerender(<GroupToggle grouped onToggle={() => {}} />)

    expect(container.querySelector('svg')?.innerHTML).not.toBe(before)
  })

  it('calls onToggle when pressed', () => {
    const onToggle = vi.fn()
    render(<GroupToggle grouped={false} onToggle={onToggle} />)

    fireEvent.click(screen.getByRole('button'))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
