import { DEFAULT_NOTE_COLOR, NoteGrid } from '@md-viz/ui'
import type { Note } from './fake-sync'

/** the height (px) of the bar the note grid has across its top. */
const BAR = 32

type MockGridProps = {
  notes: Note[]
  label: string
  /** the drawing height (px) under the bar, or undefined to fill the height of the column. */
  height: number | undefined
}

/**
 * one of the status grids of this exploration, drawn with the current note grid as a single grey
 * set. the exploration is about where the three grids sit in the window; the grid itself has
 * changed since (see the exploration note-grid-sets), so it is only a stand-in here.
 */
export function MockGrid({ notes, label, height }: MockGridProps) {
  return (
    <div
      className={height === undefined ? 'h-full' : undefined}
      style={height === undefined ? undefined : { height: height + BAR }}
    >
      <NoteGrid
        label={label}
        sets={[{ id: label, name: label, color: DEFAULT_NOTE_COLOR, notes }]}
      />
    </div>
  )
}
