import { useMemo, useRef, useState } from 'react'
import { NoteGrid, latticeSpacing, useDotLattice } from '@md-viz/ui'
import type { Note } from '@md-viz/ui'
import type { NoteRef, SyncNotes } from '../../shared/ipc'

const GRID_HEIGHT = 160
// every status gets a column this wide, empty or not.
const COLUMN_WIDTH = 272
// the least space between columns; widened so the column pitch is a whole number of dot spacings.
const MIN_GAP = 32
// every note gets the same color until color carries meaning.
const NOTE_COLOR = 0

const GROUPS = ['updated', 'deleted', 'unchanged'] as const
type Group = (typeof GROUPS)[number]

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

function StatusGrid({ label, notes, reference, onCellChange, cellStep, gridRef }: StatusGridProps) {
  const cells = useMemo<Note[]>(
    () => notes.map((note) => ({ id: note.id, title: note.title, color: NOTE_COLOR })),
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

/**
 * the notes of a sync as three grids: updated, deleted and unchanged. the page's dots line up
 * with the squares of the biggest grid; the others use whole multiples of its dot spacing.
 */
export function SyncGrids({ notes }: { notes: SyncNotes }) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [cell, setCell] = useState<number | null>(null)
  const reference = GROUPS.reduce((most, group) =>
    notes[group].length > notes[most].length ? group : most,
  )
  const activeCell = notes[reference].length > 0 ? cell : null
  useDotLattice(gridRef, activeCell)

  const spacing = activeCell === null ? undefined : latticeSpacing(activeCell)
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
          onCellChange={setCell}
          cellStep={spacing}
          gridRef={gridRef}
        />
      ))}
    </div>
  )
}
