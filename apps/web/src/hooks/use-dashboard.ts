import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listNotesOptions, listSetsOptions } from '@md-viz/api-client/cache/react-query'
import type { Note } from '@md-viz/ui'
import { pickSource, setsFor } from '../lib/dashboard-sets'

/** the cached notes and the sets to show, loaded together; `retry` reloads whatever failed. */
export function useDashboard() {
  const notesQuery = useQuery(listNotesOptions({ query: { fields: 'title' } }))
  const setsQuery = useQuery(listSetsOptions())

  const notes = useMemo<Note[]>(
    () =>
      (notesQuery.data ?? []).map((note) => ({
        id: note.id,
        title: note.fields.title ?? note.id,
        colors: [],
      })),
    [notesQuery.data],
  )
  const sets = useMemo(
    () => setsFor(pickSource(setsQuery.data ?? []), setsQuery.data ?? []),
    [setsQuery.data],
  )

  const status = notesQuery.error || setsQuery.error ? 'error' : null
  const pending = notesQuery.isPending || setsQuery.isPending

  const retry = () => {
    if (notesQuery.error) void notesQuery.refetch()
    if (setsQuery.error) void setsQuery.refetch()
  }

  return { status: status ?? (pending ? 'pending' : 'ready'), notes, sets, retry }
}
