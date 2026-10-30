import { configureCacheClient, getSet, listNotes, listSets } from '@md-viz/api-client/cache'
import { parseSource } from '../target'
import type { NoteSet } from '../types'
import { DEFAULT_CACHE_URL } from './sync'

export interface NoteSetsOptions {
  /** the grouping whose sets are loaded; the facet an app shows. */
  grouping: string
  baseUrl?: string
  /** replaces the global fetch, for tests. */
  fetch?: typeof fetch
}

/**
 * the sets of one grouping of a source (`source` is validated first) with their notes, as the
 * cache holds them after the last sync: in the cache's order (rank, then id), each with its colour
 * and its notes titled by their title, else their id. the `sync` grouping lists deleted notes, so
 * their titles are read too. a note id a set lists but the cache no longer has keeps its id as
 * the title.
 */
export async function loadNoteSets(
  source: unknown,
  { grouping, baseUrl = DEFAULT_CACHE_URL, fetch: fetchImpl }: NoteSetsOptions,
): Promise<NoteSet[]> {
  const checked = parseSource(source)
  configureCacheClient(fetchImpl ? { baseUrl, fetch: fetchImpl } : { baseUrl })

  const { data: sets } = await listSets({
    query: { source: checked, grouping },
    throwOnError: true,
  })
  const { data: rows } = await listNotes({
    query: { fields: 'title', grouping },
    throwOnError: true,
  })
  const titles = new Map(rows.map((row) => [row.id, row.fields['title']]))

  return Promise.all(
    sets.map(async ({ id, color, count }) => {
      const noteIds =
        count === 0
          ? []
          : (
              await getSet({
                query: { source: checked, grouping, id },
                throwOnError: true,
              })
            ).data.noteIds
      return {
        id,
        name: id,
        color,
        notes: noteIds.map((noteId) => ({ id: noteId, title: titles.get(noteId) ?? noteId })),
      }
    }),
  )
}
