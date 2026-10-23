import { render } from '@testing-library/react'
import { MockCard } from '../../../src/explorations/background/mock-card'

describe('MockCard', () => {
  it('pads the card when it is not aligned to the lattice', () => {
    const { container } = render(
      <MockCard mode="light" cell={8} columns={2} rows={2} aligned={false} />,
    )

    expect(container.firstElementChild).toHaveClass('p-3')
  })

  it('has no padding when aligned, so the squares start on the card corner', () => {
    const { container } = render(<MockCard mode="dark" cell={8} columns={2} rows={2} aligned />)
    const card = container.firstElementChild!

    expect(card).not.toHaveClass('p-3')
    expect(card).toHaveStyle({ backgroundColor: 'rgb(7, 54, 66)' })
  })

  it('holds a block of squares', () => {
    const { container } = render(<MockCard mode="light" cell={8} columns={3} rows={2} aligned />)

    expect(container.querySelectorAll('[aria-hidden] > div')).toHaveLength(6)
  })
})
