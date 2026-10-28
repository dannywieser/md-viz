import { useMemo } from 'react'
import { DEFAULT_NOTE_COLOR, NoteGrid } from '@md-viz/ui'
import type { Note } from '@md-viz/ui'
import type { NoteRef } from '../../../shared/ipc'
import { COLUMN_WIDTH } from '../../../shared/window-size'
import type { Group } from '../lib/sync-layout'

interface StatusGridProps {
  label: Group
  notes: NoteRef[]
  /** the grid whose first square the page's dots line up with. */
  reference: boolean
  /** the reference grid reports its cell here. */
  onCellChange: (cell: number) => void
  /** the other grids only use whole multiples of this, so their squares sit on the dots too. */
  cellStep: number | undefined
  gridRef: React.RefObject<HTMLDivElement | null>
  /** the drawing height (px), or undefined to fill the height of the column. */
  height: number | undefined
  /** where the block sits in its column: the last one is pinned right so its edge meets the status card's. */
  align: 'start' | 'end'
}

export function StatusGrid({
  label,
  notes,
  reference,
  onCellChange,
  cellStep,
  gridRef,
  height,
  align,
}: StatusGridProps) {
  const cells = useMemo<Note[]>(
    () => notes.map((note) => ({ id: note.id, title: note.title, color: DEFAULT_NOTE_COLOR })),
    [notes],
  )
  return (
    <section aria-label={label} className="shrink-0" style={{ width: COLUMN_WIDTH }}>
      <NoteGrid
        notes={cells}
        label={label}
        height={height}
        // grids start at the column's top, so their squares line up across columns.
        align={align}
        compactEmpty
        {...(reference ? { ref: gridRef, onCellChange } : { cellStep })}
      />
    </section>
  )
}
