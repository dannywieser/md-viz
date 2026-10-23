import { render, screen } from '@testing-library/react'
import { GridSpot } from '../../../src/explorations/states/grid-spot'

describe('GridSpot', () => {
  it('is a card-coloured block with a hard shadow around its content', () => {
    render(
      <GridSpot>
        <p>inside</p>
      </GridSpot>,
    )

    expect(screen.getByText('inside').parentElement).toHaveClass('bg-card', 'shadow-hard')
  })
})
