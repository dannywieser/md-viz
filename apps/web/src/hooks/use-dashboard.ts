import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  listNotesOptions,
  listSetsOptions,
  listTagColorsOptions,
} from '@md-viz/api-client/cache/react-query'
import type { Note } from '@md-viz/ui'
import { pickSource, setsFor } from '../lib/dashboard-sets'
import { toGridNote } from '../lib/grid-note'

/** the cached notes, coloured by their tags, and the sets to show, loaded together; `retry` reloads whatever failed. */
export function useDashboard() {
  const notesQuery = useQuery(listNotesOptions({ query: { fields: 'title,tags' } }))
  const setsQuery = useQuery(listSetsOptions())
  const tagColorsQuery = useQuery(listTagColorsOptions())

  const notes = useMemo<Note[]>(() => {
    const colors = new Map((tagColorsQuery.data?.tags ?? []).map(({ tag, color }) => [tag, color]))
    return (notesQuery.data ?? []).map((row) => toGridNote(row, colors))
  }, [notesQuery.data, tagColorsQuery.data])
  const sets = useMemo(
    () => setsFor(pickSource(setsQuery.data ?? []), setsQuery.data ?? []),
    [setsQuery.data],
  )

  const queries = [notesQuery, setsQuery, tagColorsQuery]
  const status = queries.some((query) => query.error) ? 'error' : null
  const pending = queries.some((query) => query.isPending)

  const retry = () => {
    for (const query of queries) {
      if (query.error) void query.refetch()
    }
  }

  return { status: status ?? (pending ? 'pending' : 'ready'), notes, sets, retry }
}
