import { NoteGrid } from '@md-viz/ui'
import type { GridSet } from '@md-viz/ui'

type TagGridProps = {
  /** the notes by tag set, the last of them the notes with no tag. */
  sets: GridSet[]
  /** the grid block, when this grid is the one the page's dots follow. */
  gridRef?: React.Ref<HTMLDivElement>
  onCellChange?: (cell: number) => void
}

/** every cached note as one grid, coloured and grouped by its tag set. */
export function TagGrid({ sets, gridRef, onCellChange }: TagGridProps) {
  return <NoteGrid ref={gridRef} sets={sets} onCellChange={onCellChange} />
}
