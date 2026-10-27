import { render, screen } from '@testing-library/react'
import { doneGroups, emptyGroups } from '../../../src/explorations/sync-layout/fake-sync'
import { StatusGrids } from '../../../src/explorations/sync-layout/status-grids'
import { COLUMN_WIDTH } from '../../../src/explorations/sync-layout/window-size'

describe('StatusGrids', () => {
  it('shows a grid for each group, all in columns of the same width', () => {
    render(<StatusGrids groups={doneGroups()} />)

    for (const name of ['updated', 'deleted', 'unchanged']) {
      expect(screen.getByRole('region', { name })).toHaveStyle({ width: `${COLUMN_WIDTH}px` })
    }
  })

  it('shows empty grids too', () => {
    render(<StatusGrids groups={emptyGroups()} />)

    expect(screen.getAllByRole('region')).toHaveLength(3)
  })
})
