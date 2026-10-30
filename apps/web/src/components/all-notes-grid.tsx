import { useMemo } from 'react'
import { DEFAULT_NOTE_COLOR, NoteGrid } from '@md-viz/ui'
import type { GridNote } from '@md-viz/ui'

type AllNotesGridProps = {
  notes: GridNote[]
  /** the grid block, when this grid is the one the page's dots follow. */
  gridRef?: React.Ref<HTMLDivElement>
  onCellChange?: (cell: number) => void
}

/** every cached note as one grid, all in one grey set for now. */
export function AllNotesGrid({ notes, gridRef, onCellChange }: AllNotesGridProps) {
  const sets = useMemo(
    () => [{ id: 'all', name: 'all notes', color: DEFAULT_NOTE_COLOR, notes }],
    [notes],
  )
  return <NoteGrid ref={gridRef} label="all notes" sets={sets} onCellChange={onCellChange} />
}
