import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listNotesOptions } from '@md-viz/api-client/cache/react-query'
import { DEFAULT_NOTE_COLOR, Message, NoteGrid, useGridLattice } from '@md-viz/ui'
import type { Note } from '@md-viz/ui'

/** the cached notes as a grid, one cell per note, in the cache's order. */
export function CacheNoteGrid() {
  const { data, error, isPending } = useQuery(listNotesOptions({ query: { fields: 'title' } }))
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

  if (isPending) return <Message fill>loading notes</Message>
  if (error) return <Message fill>could not load notes from the cache</Message>

  return <NoteGrid ref={ref} notes={notes} onCellChange={onCellChange} />
}
