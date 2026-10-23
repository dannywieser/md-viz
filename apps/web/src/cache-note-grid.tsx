import { useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listNotesOptions } from '@md-viz/api-client/cache/react-query'
import { NoteGrid, useDotLattice } from '@md-viz/ui'
import type { Note } from '@md-viz/ui'
import { Message } from './message'

// every note gets the same color until color carries meaning.
const NOTE_COLOR = 0

/** the cached notes as a grid, one cell per note, in the cache's order. */
export function CacheNoteGrid() {
  const { data, error, isPending } = useQuery(listNotesOptions({ query: { fields: 'title' } }))
  const cardRef = useRef<HTMLDivElement>(null)
  const [cell, setCell] = useState<number | null>(null)
  useDotLattice(cardRef, cell)

  const notes = useMemo<Note[]>(
    () =>
      (data ?? []).map((note) => ({
        id: note.id,
        title: note.fields.title ?? note.id,
        color: NOTE_COLOR,
      })),
    [data],
  )

  if (isPending) return <Message>loading notes</Message>
  if (error) return <Message>could not load notes from the cache</Message>

  return <NoteGrid ref={cardRef} notes={notes} onCellChange={setCell} />
}
