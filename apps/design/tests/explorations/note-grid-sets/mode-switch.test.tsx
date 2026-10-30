import { fireEvent, render, screen } from '@testing-library/react'
import { ModeSwitch } from '../../../src/explorations/note-grid-sets/mode-switch'

const options = [
  { value: 'a', label: 'mode a' },
  { value: 'b', label: 'mode b' },
]

describe('ModeSwitch', () => {
  it('marks the current mode as pressed', () => {
    render(<ModeSwitch label="mode" options={options} value="b" onChange={() => undefined} />)

    expect(screen.getByRole('button', { name: 'mode b' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'mode a' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('reports the picked mode', () => {
    const onChange = vi.fn()
    render(<ModeSwitch label="mode" options={options} value="b" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'mode a' }))

    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('is a labelled group', () => {
    render(<ModeSwitch label="mode" options={options} value="a" onChange={() => undefined} />)

    expect(screen.getByRole('group', { name: 'mode' })).toBeInTheDocument()
  })
})
