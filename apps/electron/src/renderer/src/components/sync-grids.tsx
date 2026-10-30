import { latticeSpacing, useGridLattice } from '@md-viz/ui'
import type { SyncNotes } from '../../../shared/ipc'
import { COLUMN_WIDTH } from '../../../shared/window-size'
import { columnPitch, gridHeight, GROUPS } from '../lib/sync-layout'
import { StatusGrid } from './status-grid'

/**
 * the notes of a sync as three grids in columns of one width: updated, deleted and unchanged. a
 * grid of many notes fills the height it is given, one of a few keeps the small height. the page's
 * dots line up with the squares of the biggest grid.
 */
export function SyncGrids({ notes }: { notes: SyncNotes }) {
  const reference = GROUPS.reduce((most, group) =>
    notes[group].length > notes[most].length ? group : most,
  )
  const { ref, cell, onCellChange } = useGridLattice(notes[reference].length > 0)

  const spacing = cell === null ? undefined : latticeSpacing(cell)
  const gap = columnPitch(spacing) - COLUMN_WIDTH

  return (
    <div className="flex h-full" style={{ columnGap: gap }}>
      {GROUPS.map((group) => (
        <StatusGrid
          key={group}
          label={group}
          notes={notes[group]}
          reference={group === reference}
          onCellChange={onCellChange}
          gridRef={ref}
          height={gridHeight(notes[group].length)}
        />
      ))}
    </div>
  )
}
