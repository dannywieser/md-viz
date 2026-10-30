import { useMemo } from 'react'
import { DEFAULT_NOTE_COLOR, NoteGrid } from '@md-viz/ui'
import type { NoteRef } from '../../../shared/ipc'
import { COLUMN_WIDTH } from '../../../shared/window-size'
import { toCells } from '../lib/cells'
import type { Group } from '../lib/sync-layout'

/** the height (px) of the bar across the top of a note grid, under which the drawing height is counted. */
const BAR = 32

interface StatusGridProps {
  label: Group
  notes: NoteRef[]
  /** the grid whose first square the page's dots line up with. */
  reference: boolean
  /** the reference grid reports its cell here. */
  onCellChange: (cell: number) => void
  gridRef: React.RefObject<HTMLDivElement | null>
  /** the drawing height (px) under the grid's bar, or undefined to fill the height of the column. */
  height: number | undefined
}

/** one column with a grid of the notes as a single grey set; the three columns are replaced by one grid grouped by the sync sets in a later step. */
export function StatusGrid({
  label,
  notes,
  reference,
  onCellChange,
  gridRef,
  height,
}: StatusGridProps) {
  const sets = useMemo(
    () => [{ id: label, name: label, color: DEFAULT_NOTE_COLOR, notes: toCells(notes) }],
    [label, notes],
  )
  return (
    <section aria-label={label} className="shrink-0" style={{ width: COLUMN_WIDTH }}>
      <div
        className={height === undefined ? 'h-full' : undefined}
        style={height === undefined ? undefined : { height: height + BAR }}
      >
        <NoteGrid
          sets={sets}
          label={label}
          {...(reference ? { ref: gridRef, onCellChange } : {})}
        />
      </div>
    </section>
  )
}
