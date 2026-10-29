import { render, screen } from '@testing-library/react'
import { Loader, loaderFills } from '../../src'

const variant = loaderFills[0]

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Loader', () => {
  it('is a status with an aria label and no visible text', () => {
    const { container } = render(<Loader fill={variant} label="loading notes" />)

    expect(screen.getByRole('status', { name: 'loading notes' })).toBeInTheDocument()
    expect(container.textContent).toBe('')
  })

  it('draws the well and one animated square per cell', () => {
    const { container } = render(<Loader fill={variant} cols={4} rows={3} cell={5} />)
    const svg = container.querySelector('svg')!

    expect(svg).toHaveAttribute('width', '30')
    expect(svg).toHaveAttribute('height', '20')
    expect(svg.querySelectorAll('rect')).toHaveLength(3 + 12)
    expect(svg.querySelectorAll('animate')).toHaveLength(12)
  })

  it('turns each square on in fill order', () => {
    const { container } = render(<Loader fill={variant} cols={2} rows={1} />)
    const [first, second] = [...container.querySelectorAll('animate')].map((node) =>
      Number(node.getAttribute('keyTimes')!.split(';')[1]),
    )

    expect(first).toBeLessThan(second)
  })

  it('colours the squares like the note grid, a colour per piece', () => {
    const { container } = render(<Loader fill={variant} cols={4} rows={4} />)
    const squares = [...container.querySelectorAll('.note-square')]

    expect(squares).toHaveLength(16)
    expect(new Set(squares.map((rect) => rect.getAttribute('data-color')))).toEqual(
      new Set(['0', '1', '2', '3']),
    )
    expect(squares[0]).not.toHaveAttribute('fill')
  })

  it('wraps around the palette after its last colour', () => {
    const { container } = render(<Loader fill={variant} cols={8} rows={6} />)
    const colors = [...container.querySelectorAll('.note-square')].map((rect) =>
      Number(rect.getAttribute('data-color')),
    )

    expect(Math.max(...colors)).toBe(7)
    expect(colors).toContain(1)
  })

  it('animates the fall of a dropping variant, from the top to its place', () => {
    const drop = loaderFills.find((v) => v.drop)!
    const { container } = render(<Loader fill={drop} cols={2} rows={2} />)
    const falls = container.querySelectorAll('animate[attributeName="y"]')

    expect(falls).toHaveLength(4)
    const landings = [...falls].map((node) => node.getAttribute('values')!.split(';')[2])
    expect(landings.sort()).toEqual(['0', '0', '1', '1'])
  })

  it('does not animate position for the other variants', () => {
    const { container } = render(<Loader fill={variant} cols={2} rows={2} />)

    expect(container.querySelectorAll('animate[attributeName="y"]')).toHaveLength(0)
  })

  it('shows half the squares still when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const { container } = render(<Loader fill={variant} cols={2} rows={2} />)

    expect(container.querySelectorAll('animate')).toHaveLength(0)
    const squares = [...container.querySelectorAll('rect')].slice(3)
    expect(squares.filter((rect) => rect.getAttribute('opacity') === '1')).toHaveLength(2)
  })

  it('animates when reduced motion is not preferred', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const { container } = render(<Loader fill={variant} cols={2} rows={2} />)

    expect(container.querySelectorAll('animate')).toHaveLength(4)
  })

  it('picks a fill at random when it mounts and keeps it', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const { container, rerender } = render(<Loader />)
    expect(container.querySelectorAll('animate[attributeName="y"]')).toHaveLength(48)

    random.mockReturnValue(0)
    rerender(<Loader label="still loading" />)

    expect(random).toHaveBeenCalledTimes(1)
    expect(container.querySelectorAll('animate[attributeName="y"]')).toHaveLength(48)
  })

  it('picks another fill for another random number', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { container } = render(<Loader />)

    expect(container.querySelectorAll('animate[attributeName="y"]')).toHaveLength(0)
  })
})
