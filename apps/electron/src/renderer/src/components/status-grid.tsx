import { useMemo } from 'react'
import { DEFAULT_NOTE_COLOR, NoteGrid } from '@md-viz/ui'
import type { Note } from '@md-viz/ui'
import type { NoteRef } from '../../../shared/ipc'
import { COLUMN_WIDTH, GRID_HEIGHT, type Group } from '../lib/sync-layout'

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
}

export function StatusGrid({
  label,
  notes,
  reference,
  onCellChange,
  cellStep,
  gridRef,
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
        height={GRID_HEIGHT}
        // grids start at the column's top-left, so their squares line up across columns.
        align="start"
        {...(reference ? { ref: gridRef, onCellChange } : { cellStep })}
      />
    </section>
  )
}
