import { render, screen } from '@testing-library/react'
import { LatticeCode } from '../../src/sections/lattice-code'

describe('LatticeCode', () => {
  it('shows both excerpts', () => {
    render(<LatticeCode divided={false} />)

    expect(screen.getByText(/export function latticeSpacing/)).toBeInTheDocument()
    expect(screen.getByText(/--grid-origin-x/)).toBeInTheDocument()
  })

  it('highlights the line a cell under the maximum runs', () => {
    render(<LatticeCode divided={false} />)

    expect(screen.getByText(/return cell \*/)).toHaveClass('bg-primary')
    expect(screen.getByText(/if \(cell > max\)/)).not.toHaveClass('bg-primary')
  })

  it('highlights the line a cell over the maximum runs', () => {
    render(<LatticeCode divided />)

    expect(screen.getByText(/if \(cell > max\)/)).toHaveClass('bg-primary')
    expect(screen.getByText(/return cell \*/)).not.toHaveClass('bg-primary')
  })
})
