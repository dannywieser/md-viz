import { render, screen } from '@testing-library/react'
import { LatticeStage } from '../../../src/explorations/note-grid-sets/lattice-stage'

describe('LatticeStage', () => {
  it('sizes the grid area and shows its children', () => {
    render(
      <LatticeStage cell={10} width={200} height={100}>
        <span>grid</span>
      </LatticeStage>,
    )

    expect(screen.getByText('grid').parentElement).toHaveStyle({ width: '200px', height: '100px' })
  })

  it('sets the dot lattice from the first square', () => {
    render(
      <LatticeStage cell={10} width={200} height={100}>
        <span className="note-square" />
      </LatticeStage>,
    )

    const stage = document.querySelector('.bg-dots') as HTMLElement
    expect(stage.style.getPropertyValue('--grid-size')).toBe('20px')
  })
})
