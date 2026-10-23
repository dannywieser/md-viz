import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Background } from '../../../src/explorations/background/background'
import { BackgroundSwatch } from '../../../src/explorations/background/background-swatch'
import { variants } from '../../../src/explorations/background/background-variants'
import { expectLowercase } from '../../lowercase'

vi.mock('../../../src/explorations/background/background-swatch', () => ({
  BackgroundSwatch: vi.fn(() => <div />),
}))

const lastProps = () => vi.mocked(BackgroundSwatch).mock.lastCall![0]

describe('Background', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows every variant in light and dark', () => {
    const { container } = render(<Background />)

    for (const variant of variants) {
      expect(screen.getByRole('heading', { level: 2, name: variant.name })).toBeInTheDocument()
    }
    const modes = vi.mocked(BackgroundSwatch).mock.calls.map(([props]) => props.mode)
    expect(modes.filter((mode) => mode === 'light')).toHaveLength(variants.length)
    expect(modes.filter((mode) => mode === 'dark')).toHaveLength(variants.length)
    expectLowercase(container)
  })

  it('starts with one card, a 16px cell and normal strength', () => {
    render(<Background />)

    expect(lastProps()).toMatchObject({ layout: 'single', cell: 16, strength: 1 })
  })

  it('switches between one card and several cards', async () => {
    render(<Background />)

    await userEvent.click(screen.getByRole('button', { name: 'several cards' }))
    expect(lastProps().layout).toBe('several')

    await userEvent.click(screen.getByRole('button', { name: 'one card' }))
    expect(lastProps().layout).toBe('single')
  })

  it('follows the cell and strength sliders', () => {
    render(<Background />)
    const [cell, strength] = screen.getAllByRole('slider')

    fireEvent.change(cell, { target: { value: '8' } })
    fireEvent.change(strength, { target: { value: '1.5' } })

    expect(lastProps()).toMatchObject({ cell: 8, strength: 1.5 })
    expect(screen.getByText('densest card cell 8px', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('strength 1.5x', { exact: false })).toBeInTheDocument()
  })
})
