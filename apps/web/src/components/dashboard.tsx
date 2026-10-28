import { ErrorState, Loader, StateBlock, useGridLattice } from '@md-viz/ui'
import { useDashboard } from '../hooks/use-dashboard'
import { AllNotesGrid } from './all-notes-grid'
import { SetGrid } from './set-grid'

/**
 * the cached notes as a dashboard of floating grids: the automatic sets in two columns and all
 * notes, the one with the most notes and so the reference for the page's dots, in a narrower third.
 */
export function Dashboard() {
  const { status, notes, sets, retry } = useDashboard()
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
    <div className="grid h-full grid-cols-[2fr_2fr_1fr] grid-rows-2 gap-6">
      {sets.map((set) => (
        <div key={set.id} className="min-h-0 min-w-0">
          <SetGrid id={set.id} label={set.label} notes={notes} />
        </div>
      ))}
      <div className="col-start-3 row-span-2 row-start-1 min-h-0 min-w-0">
        <AllNotesGrid notes={notes} gridRef={ref} onCellChange={onCellChange} />
      </div>
    </div>
  )
}
