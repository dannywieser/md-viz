import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SourceSelect } from '../../../src/renderer/src/components/source-select'

describe('SourceSelect', () => {
  it('shows the selected source', () => {
    render(<SourceSelect value="bear" onChange={vi.fn()} />)

    expect(screen.getByRole('combobox', { name: 'source' })).toHaveTextContent('bear')
  })

  it('offers file and bear and reports the one picked', async () => {
    const onChange = vi.fn()
    render(<SourceSelect value="file" onChange={onChange} />)

    await userEvent.click(screen.getByRole('combobox', { name: 'source' }))
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'file',
      'bear',
    ])
    await userEvent.click(screen.getByRole('option', { name: 'bear' }))

    expect(onChange).toHaveBeenCalledWith('bear')
  })

  it('can be disabled', () => {
    render(<SourceSelect value="file" onChange={vi.fn()} disabled />)

    expect(screen.getByRole('combobox', { name: 'source' })).toBeDisabled()
  })
})
