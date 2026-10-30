import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listNotesOptions } from '@md-viz/api-client/cache/react-query'
import type { GridNote } from '@md-viz/ui'
import { toGridNote } from '../lib/grid-note'

/** the cached notes as grid notes (one grey set for now: the grid by tag sets comes in a later step); `retry` reloads them after a failure. */
export function useDashboard() {
  const notesQuery = useQuery(listNotesOptions({ query: { fields: 'title' } }))

  const notes = useMemo<GridNote[]>(
    () => (notesQuery.data ?? []).map((row) => toGridNote(row)),
    [notesQuery.data],
  )

  const status = notesQuery.error ? 'error' : notesQuery.isPending ? 'pending' : 'ready'

  const retry = () => {
    if (notesQuery.error) void notesQuery.refetch()
  }

  return { status, notes, retry }
}
