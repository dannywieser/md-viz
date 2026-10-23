import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listNotesOptions } from '@md-viz/api-client/cache/react-query'
import {
  DEFAULT_NOTE_COLOR,
  ErrorState,
  Loader,
  NoteGrid,
  StateBlock,
  useGridLattice,
} from '@md-viz/ui'
import type { Note } from '@md-viz/ui'

/** the cached notes as a grid, one cell per note, in the cache's order. */
export function CacheNoteGrid() {
  const { data, error, isPending, refetch } = useQuery(
    listNotesOptions({ query: { fields: 'title' } }),
  )
  const { ref, onCellChange } = useGridLattice()

  const notes = useMemo<Note[]>(
    () =>
      (data ?? []).map((note) => ({
        id: note.id,
        title: note.fields.title ?? note.id,
        color: DEFAULT_NOTE_COLOR,
      })),
    [data],
  )

  if (isPending) {
    return (
      <StateBlock fill>
        <Loader label="loading notes" />
      </StateBlock>
    )
  }
  if (error) {
    return (
      <StateBlock fill>
        <ErrorState detail="could not load notes from the cache" onRetry={() => void refetch()} />
      </StateBlock>
    )
  }

  return <NoteGrid ref={ref} notes={notes} onCellChange={onCellChange} />
}
