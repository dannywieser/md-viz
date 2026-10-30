import { ErrorState, Loader, StateBlock, useGridLattice } from '@md-viz/ui'
import { useDashboard } from '../hooks/use-dashboard'
import { AllNotesGrid } from './all-notes-grid'

/**
 * the cached notes as a dashboard. for now it is one floating grid of all notes, the reference for
 * the page's dots; the grids for the cache's sets come back in a later change.
 */
export function Dashboard() {
  const { status, notes, retry } = useDashboard()
  const { ref, onCellChange } = useGridLattice(notes.length > 0)

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
      <AllNotesGrid notes={notes} gridRef={ref} onCellChange={onCellChange} />
    </div>
  )
}
