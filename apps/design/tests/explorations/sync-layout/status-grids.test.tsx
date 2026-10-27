import { render, screen } from '@testing-library/react'
import { doneGroups, emptyGroups } from '../../../src/explorations/sync-layout/fake-sync'
import { StatusGrids } from '../../../src/explorations/sync-layout/status-grids'

describe('StatusGrids', () => {
  it('shows a grid for each group', () => {
    render(<StatusGrids groups={doneGroups()} />)

    for (const name of ['updated', 'deleted', 'unchanged']) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument()
    }
  })

  it('shows empty grids too', () => {
    render(<StatusGrids groups={emptyGroups()} />)

    expect(screen.getAllByRole('region')).toHaveLength(3)
  })
})
