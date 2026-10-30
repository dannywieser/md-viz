import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import {
  getSetOptions,
  listNotesOptions,
  listSetsOptions,
} from '@md-viz/api-client/cache/react-query'
import type { GetSetError, Set as CacheSet } from '@md-viz/api-client/cache'
import type { GridSet } from '@md-viz/ui'
import { toGridSets } from '../lib/grid-sets'

/** the grouping the dashboard colours and groups by. */
export const GROUPING = 'tags'

/** what the sets' detail queries amount to: their sets, whether any is loading and one retry for those that failed. */
function combineDetails(results: UseQueryResult<CacheSet, GetSetError>[]) {
  return {
    sets: results.flatMap((result) => (result.data ? [result.data] : [])),
    pending: results.some((result) => result.isPending),
    failed: results.some((result) => result.error),
    retry: () => {
      for (const result of results) if (result.error) void result.refetch()
    },
  }
}

/**
 * the cached notes as the sets of the `tags` grouping, for the grid: the list of sets, one query for
 * the notes of each set that has some and the titles of the notes; `retry` reloads what failed.
 */
export function useDashboard() {
  const setsQuery = useQuery(listSetsOptions({ query: { grouping: GROUPING } }))
  const notesQuery = useQuery(listNotesOptions({ query: { fields: 'title' } }))
  const details = useQueries({
    queries: (setsQuery.data ?? [])
      .filter((set) => set.count > 0)
      .map((set) =>
        getSetOptions({ query: { source: set.source, grouping: set.grouping, id: set.id } }),
      ),
    combine: combineDetails,
  })

  const sets = useMemo<GridSet[]>(
    () => toGridSets(details.sets, notesQuery.data ?? []),
    [details.sets, notesQuery.data],
  )

  const failed = Boolean(setsQuery.error) || Boolean(notesQuery.error) || details.failed
  const pending = setsQuery.isPending || notesQuery.isPending || details.pending
  const status = failed ? 'error' : pending ? 'pending' : 'ready'

  const retry = () => {
    if (setsQuery.error) void setsQuery.refetch()
    if (notesQuery.error) void notesQuery.refetch()
    details.retry()
  }

  return { status, sets, retry }
}
