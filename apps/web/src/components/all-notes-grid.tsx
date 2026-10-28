import { NoteGrid } from '@md-viz/ui'
import type { Note } from '@md-viz/ui'

type AllNotesGridProps = {
  notes: Note[]
  /** the grid block, when this grid is the one the page's dots follow. */
  gridRef?: React.Ref<HTMLDivElement>
  onCellChange?: (cell: number) => void
}

/** every cached note as one labelled grid. */
export function AllNotesGrid({ notes, gridRef, onCellChange }: AllNotesGridProps) {
  return <NoteGrid ref={gridRef} label="all notes" notes={notes} onCellChange={onCellChange} />
}
