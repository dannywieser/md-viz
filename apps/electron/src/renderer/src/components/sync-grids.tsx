import { useEffect, type ReactNode } from 'react'
import { gridBlockSize, latticeSpacing, STROKE_ROOM, useGridLattice } from '@md-viz/ui'
import type { SyncNotes } from '../../../shared/ipc'
import { StatusGrid } from './status-grid'
import { COLUMN_WIDTH, GRID_HEIGHT, GROUPS, MIN_GAP } from '../lib/sync-layout'

/**
 * the notes of a sync as three grids: updated, deleted and unchanged. the page's dots line up
 * with the squares of the biggest grid; the others use whole multiples of its dot spacing.
 * `children` sit above the grids and are as wide as they are, up to the right edge of the last block.
 */
export function SyncGrids({
  notes,
  children,
  onWidthChange,
}: {
  notes: SyncNotes
  children?: ReactNode
  /** called with the width of the grids' row (null once they are gone), e.g. to size the header to match. */
  onWidthChange?: (width: number | null) => void
}) {
  const reference = GROUPS.reduce((most, group) =>
    notes[group].length > notes[most].length ? group : most,
  )
  const { ref, cell, onCellChange } = useGridLattice(notes[reference].length > 0)

  // empty grids are as big as the reference block; with nothing to copy they fill their column.
  const count = notes[reference].length
  const emptySize =
    count > 0 ? gridBlockSize({ count, width: COLUMN_WIDTH, height: GRID_HEIGHT }) : undefined

  const spacing = cell === null ? undefined : latticeSpacing(cell)
  // the column width is fixed (the cell depends on it), so the gap absorbs the rounding.
  const gap = spacing
    ? Math.ceil((COLUMN_WIDTH + MIN_GAP) / spacing) * spacing - COLUMN_WIDTH
    : MIN_GAP

  // the last block is narrower than its column; the row ends at the block, not at the column.
  const last = GROUPS[GROUPS.length - 1]
  const lastBlock =
    notes[last].length > 0
      ? gridBlockSize({
          count: notes[last].length,
          width: COLUMN_WIDTH,
          height: GRID_HEIGHT,
          multipleOf: spacing,
        })
      : (emptySize ?? { width: COLUMN_WIDTH - STROKE_ROOM })
  const rowWidth = (GROUPS.length - 1) * (COLUMN_WIDTH + gap) + lastBlock.width

  useEffect(() => {
    onWidthChange?.(rowWidth)
    return () => onWidthChange?.(null)
  }, [rowWidth, onWidthChange])

  return (
    <div className="flex flex-col gap-8" style={{ width: rowWidth }}>
      {children}
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
            emptySize={emptySize}
          />
        ))}
      </div>
    </div>
  )
}
