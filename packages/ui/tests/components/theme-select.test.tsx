import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeSelect } from '../../src/components/theme-select'
import { themes } from '../../src/lib/themes'

// jsdom lacks the pointer and scroll APIs radix select uses.
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => undefined
  Element.prototype.releasePointerCapture = () => undefined
  Element.prototype.scrollIntoView = () => undefined
})

describe('ThemeSelect', () => {
  it('shows the current theme', () => {
    render(<ThemeSelect value="gotham" themes={themes} onChange={vi.fn()} />)

    expect(screen.getByRole('combobox', { name: 'theme' })).toHaveTextContent('gotham')
  })

  it('offers every theme and reports the one picked', async () => {
    const onChange = vi.fn()
    render(<ThemeSelect value="solarized" themes={themes} onChange={onChange} />)

    await userEvent.click(screen.getByRole('combobox', { name: 'theme' }))
    expect(screen.getAllByRole('option')).toHaveLength(themes.length)
    await userEvent.click(screen.getByRole('option', { name: 'dracula' }))

    expect(onChange).toHaveBeenCalledWith('dracula')
  })

  it('passes classes on to the trigger', () => {
    render(<ThemeSelect value="solarized" themes={themes} onChange={vi.fn()} className="w-44" />)

    expect(screen.getByRole('combobox', { name: 'theme' })).toHaveClass('w-44')
  })
})
