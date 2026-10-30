import { NoteGrid, useGridLattice } from '@md-viz/ui'
import type { NoteSet } from '../../../shared/ipc'

/** the notes of the sync sets as one grid filling its container; the page's dots line up with its squares. */
export function SyncGrid({ sets }: { sets: NoteSet[] }) {
  const { ref, onCellChange } = useGridLattice(sets.some((set) => set.notes.length > 0))
  return <NoteGrid sets={sets} ref={ref} onCellChange={onCellChange} />
}
