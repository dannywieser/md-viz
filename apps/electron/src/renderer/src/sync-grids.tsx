import { latticeSpacing, useGridLattice } from '@md-viz/ui'
import type { SyncNotes } from '../../shared/ipc'
import { StatusGrid } from './status-grid'
import { COLUMN_WIDTH, GROUPS, MIN_GAP } from './sync-layout'

/**
 * the notes of a sync as three grids: updated, deleted and unchanged. the page's dots line up
 * with the squares of the biggest grid; the others use whole multiples of its dot spacing.
 */
export function SyncGrids({ notes }: { notes: SyncNotes }) {
  const reference = GROUPS.reduce((most, group) =>
    notes[group].length > notes[most].length ? group : most,
  )
  const { ref, cell, onCellChange } = useGridLattice(notes[reference].length > 0)

  const spacing = cell === null ? undefined : latticeSpacing(cell)
  // the column width is fixed (the cell depends on it), so the gap absorbs the rounding.
  const gap = spacing
    ? Math.ceil((COLUMN_WIDTH + MIN_GAP) / spacing) * spacing - COLUMN_WIDTH
    : MIN_GAP

  return (
    <div className="flex" style={{ columnGap: gap }}>
      {GROUPS.map((group) => (
        <StatusGrid
          key={group}
          label={group}
          notes={notes[group]}
          reference={group === reference}
          onCellChange={onCellChange}
          cellStep={spacing}
          gridRef={ref}
        />
      ))}
    </div>
  )
}
