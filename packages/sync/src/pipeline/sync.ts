import {
  addTagColors,
  configureCacheClient,
  deleteNote,
  listNotes,
  listTagColors,
  replaceSet,
  upsertNotes,
} from '@md-viz/api-client/cache'
import type { NoteRef, Source, SyncProgress, SyncResult, TagColors } from '../types'
import type { LoadedNotes } from '../sources/types'
import { buildNoteSets } from './note-sets'
import { noteToFields, type Note } from './notes'
import { assignTagColors } from './tag-colors'

export const DEFAULT_CACHE_URL = 'http://localhost:8787'

const BATCH_SIZE = 200
const DELETE_CONCURRENCY = 20

export interface SyncOptions {
  baseUrl?: string
  /** replaces the global fetch, for tests. */
  fetch?: typeof fetch
  onProgress?: (progress: SyncProgress) => void
  /** the time the automatic sets are computed at; the PC's clock unless a test sets it. */
  now?: Date
}

interface CachedNote {
  title: string
  tags: string[]
  /** NaN when the note has no usable `synced`. */
  synced: number
}

/** the tags of a cached note: its `tags` field is a JSON array of strings; anything else is no tags. */
function parseTags(value: string | undefined): string[] {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((tag) => typeof tag === 'string') : []
  } catch {
    return []
  }
}

/** the colour the cache has for each tag. */
async function fetchTagColors(): Promise<TagColors> {
  const { data } = await listTagColors({ throwOnError: true })
  return Object.fromEntries(data.tags.map(({ tag, color }) => [tag, color]))
}

/** reads the titles and sync times of the cached notes that came from `source`, by id. */
async function fetchCachedNotes(source: Source): Promise<Map<string, CachedNote>> {
  const { data: rows } = await listNotes({
    query: { fields: 'synced,title,source,tags' },
    throwOnError: true,
  })
  return new Map(
    rows
      .filter((row) => row.fields['source'] === source)
      .map((row) => [
        row.id,
        {
          title: row.fields['title'] ?? row.id,
          tags: parseTags(row.fields['tags']),
          synced: Date.parse(row.fields['synced'] ?? ''),
        },
      ]),
  )
}

/**
 * a note needs pushing when the cache has never seen it or the source changed it after the
 * cache's last sync. `synced` is stamped in whole milliseconds, like `modified`.
 */
function needsPush(note: Note, cached: Map<string, CachedNote>): boolean {
  const synced = cached.get(note.id)?.synced
  return synced === undefined || Number.isNaN(synced) || Date.parse(note.modified) > synced
}

/**
 * pushes the notes of one source to the cache, whatever that source is: new and changed notes
 * (`modified` newer than the cached `synced`) are upserted in batches, and cached notes of the
 * same source that are no longer in `loaded` are deleted. notes that exist but could not be
 * read (`loaded.failed`) are neither pushed nor deleted. the notes are loaded before this
 * runs, so nothing is deleted when loading failed; nothing is deleted either when the cache
 * cannot be listed. tags that have no colour in the cache get one first (see `assignTagColors`),
 * and the colours of all tags come back in the result. afterwards the source's automatic sets are recomputed at `now` and replaced
 * in the cache, even when no note changed, because they move with the clock.
 */
export async function syncNotes(
  source: Source,
  loaded: LoadedNotes,
  { baseUrl = DEFAULT_CACHE_URL, fetch: fetchImpl, onProgress, now = new Date() }: SyncOptions = {},
): Promise<SyncResult> {
  configureCacheClient(fetchImpl ? { baseUrl, fetch: fetchImpl } : { baseUrl })

  const { notes, failed } = loaded
  const cached = await fetchCachedNotes(source)
  const known = await fetchTagColors()
  const added = assignTagColors(
    known,
    notes.flatMap((note) => note.tags),
  )
  const present = new Set([...notes.map((note) => note.id), ...failed])
  const changed = notes.filter((note) => needsPush(note, cached))
  const changedIds = new Set(changed.map((note) => note.id))
  const gone = [...cached.keys()].filter((id) => !present.has(id))
  const ref = (note: Note): NoteRef => ({ id: note.id, title: note.title, tags: note.tags })

  const total = changed.length + gone.length
  const result: SyncResult = {
    scanned: notes.length + failed.length,
    synced: 0,
    unchanged: notes.length - changed.length,
    deleted: 0,
    failed: failed.length,
    notes: {
      updated: [],
      deleted: [],
      unchanged: notes.filter((note) => !changedIds.has(note.id)).map(ref),
    },
    tagColors: { ...known, ...added },
  }
  const report = () => onProgress?.({ synced: result.synced, deleted: result.deleted, total })
  report()

  // give the new tags their colours before any note is pushed, so no note is ever stored with a tag that has none.
  const addedTags = Object.entries(added)
  if (addedTags.length > 0) {
    await addTagColors({
      body: { tags: addedTags.map(([tag, color]) => ({ tag, color })) },
      throwOnError: true,
    })
  }

  // push new and changed notes, one batch per request.
  for (let i = 0; i < changed.length; i += BATCH_SIZE) {
    const batch = changed.slice(i, i + BATCH_SIZE)
    await upsertNotes({
      body: { notes: batch.map((note) => ({ id: note.id, fields: noteToFields(note) })) },
      throwOnError: true,
    })
    result.synced += batch.length
    result.notes.updated.push(...batch.map(ref))
    report()
  }

  // remove notes that are gone from the source, a few requests at a time.
  for (let i = 0; i < gone.length; i += DELETE_CONCURRENCY) {
    const ids = gone.slice(i, i + DELETE_CONCURRENCY)
    await Promise.all(ids.map((id) => deleteNote({ path: { id }, throwOnError: true })))
    result.deleted += ids.length
    result.notes.deleted.push(
      ...ids.map((id) => ({
        id,
        title: cached.get(id)?.title ?? id,
        tags: cached.get(id)?.tags ?? [],
      })),
    )
    report()
  }

  for (const { id, noteIds } of buildNoteSets(source, notes, now)) {
    await replaceSet({ path: { id }, body: { noteIds }, throwOnError: true })
  }

  return result
}
