import { render, screen } from '@testing-library/react'
import { BackgroundSwatch } from '../../../src/explorations/background/background-swatch'
import { variants } from '../../../src/explorations/background/background-variants'

const variant = (id: string) => variants.find((candidate) => candidate.id === id)!
const cards = (container: HTMLElement) => container.querySelectorAll('.shadow-hard')

describe('BackgroundSwatch', () => {
  it('is labelled with its mode and test id', () => {
    render(
      <BackgroundSwatch
        variant={variant('flat')}
        mode="dark"
        layout="single"
        cell={16}
        strength={1}
      />,
    )

    expect(screen.getByText('dark')).toBeInTheDocument()
    expect(screen.getByTestId('swatch-flat-dark')).toBeInTheDocument()
  })

  it('shows one card, or three of growing cells', () => {
    const props = { variant: variant('flat'), mode: 'light', cell: 16, strength: 1 } as const
    const single = render(<BackgroundSwatch {...props} layout="single" />)
    expect(cards(single.container)).toHaveLength(1)

    const several = render(<BackgroundSwatch {...props} layout="several" />)
    expect(cards(several.container)).toHaveLength(3)
  })

  it('applies the variant style', () => {
    render(
      <BackgroundSwatch
        variant={variant('dots-16')}
        mode="light"
        layout="single"
        cell={16}
        strength={1}
      />,
    )

    expect(screen.getByTestId('swatch-dots-16-light').style.backgroundSize).toBe('16px 16px')
  })

  it('puts the scaled variant on the lattice: aligned cards, padding in whole dot spacings', () => {
    const { container } = render(
      <BackgroundSwatch
        variant={variant('dots-scaled')}
        mode="light"
        layout="single"
        cell={5}
        strength={1}
      />,
    )

    expect(cards(container)[0]).not.toHaveClass('p-3')
    // cell 5 has a spacing of 20, so 24px of padding rounds up to 40.
    expect(screen.getByTestId('swatch-dots-scaled-light')).toHaveStyle({ padding: '40px' })
  })

  it('pads other variants by 24px', () => {
    render(
      <BackgroundSwatch
        variant={variant('flat')}
        mode="light"
        layout="single"
        cell={5}
        strength={1}
      />,
    )

    expect(screen.getByTestId('swatch-flat-light')).toHaveStyle({ padding: '24px' })
  })
})
