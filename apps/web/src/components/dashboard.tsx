import { ErrorState, Loader, StateBlock, useGridLattice } from '@md-viz/ui'
import { useDashboard } from '../hooks/use-dashboard'
import { TagGrid } from './tag-grid'

/** the cached notes as a dashboard: one floating grid, grouped and coloured by the tag sets, the reference for the page's dots. */
export function Dashboard() {
  const { status, sets, retry } = useDashboard()
  const { ref, onCellChange } = useGridLattice(sets.length > 0)

  if (status === 'pending') {
    return (
      <StateBlock fill>
        <Loader label="loading notes" />
      </StateBlock>
    )
  }
  if (status === 'error') {
    return (
      <StateBlock fill>
        <ErrorState detail="could not load notes from the cache" onRetry={retry} />
      </StateBlock>
    )
  }

  return (
    <div className="h-full">
      <TagGrid sets={sets} gridRef={ref} onCellChange={onCellChange} />
    </div>
  )
}
