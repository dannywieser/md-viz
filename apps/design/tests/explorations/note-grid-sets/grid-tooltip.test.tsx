import { render, screen } from '@testing-library/react'
import { GridTooltip } from '../../../src/explorations/note-grid-sets/grid-tooltip'

describe('GridTooltip', () => {
  it('shows its content above the point', () => {
    render(
      <GridTooltip x={40} y={30}>
        set a
      </GridTooltip>,
    )

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('set a')
    expect(tooltip).toHaveStyle({ left: '40px', top: '22px' })
  })
})
