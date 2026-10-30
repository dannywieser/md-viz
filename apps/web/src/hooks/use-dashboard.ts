import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listNotesOptions } from '@md-viz/api-client/cache/react-query'
import type { Note } from '@md-viz/ui'
import { toGridNote } from '../lib/grid-note'

/** the cached notes as grid notes; `retry` reloads them after a failure. */
export function useDashboard() {
  const notesQuery = useQuery(listNotesOptions({ query: { fields: 'title,tags' } }))

  const notes = useMemo<Note[]>(
    () => (notesQuery.data ?? []).map((row) => toGridNote(row)),
    [notesQuery.data],
  )

  const status = notesQuery.error ? 'error' : notesQuery.isPending ? 'pending' : 'ready'

  const retry = () => {
    if (notesQuery.error) void notesQuery.refetch()
  }

  return { status, notes, retry }
}
