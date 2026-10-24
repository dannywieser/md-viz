import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../../src'

// jsdom lacks the pointer and scroll APIs radix select uses.
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => undefined
  Element.prototype.releasePointerCapture = () => undefined
  Element.prototype.scrollIntoView = () => undefined
})

function renderSelect(props: { onValueChange?: (value: string) => void } = {}) {
  return render(
    <Select defaultValue="file" {...props}>
      <SelectTrigger aria-label="source" size="sm" className="extra">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          <SelectLabel>source</SelectLabel>
          <SelectItem value="file">file</SelectItem>
          <SelectSeparator />
          <SelectItem value="bear">bear</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>,
  )
}

describe('Select', () => {
  it('shows the selected value on the trigger', () => {
    renderSelect()
    const trigger = screen.getByRole('combobox', { name: 'source' })

    expect(trigger).toHaveTextContent('file')
    expect(trigger).toHaveAttribute('data-size', 'sm')
    expect(trigger).toHaveClass('extra')
  })

  it('lists the options and reports the one picked', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    renderSelect({ onValueChange })

    await user.click(screen.getByRole('combobox', { name: 'source' }))
    expect(screen.getByRole('option', { name: 'file' })).toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: 'bear' }))

    expect(onValueChange).toHaveBeenCalledWith('bear')
  })

  it('renders the item-aligned content and the scroll buttons', () => {
    render(
      <Select defaultValue="a" open>
        <SelectTrigger aria-label="letter">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectScrollUpButton />
          <SelectItem value="a">a</SelectItem>
          <SelectScrollDownButton />
        </SelectContent>
      </Select>,
    )

    expect(screen.getByRole('option', { name: 'a' })).toBeInTheDocument()
  })
})
