import {
  configureCacheClient,
  deleteNote,
  listNotes,
  listSets,
  replaceSet,
  upsertNotes,
} from '@md-viz/api-client/cache'
import type { NoteRef, Source, SyncProgress, SyncResult } from '../types'
import type { LoadedNotes } from '../sources/types'
import { noteToFields, type Note } from './notes'
import { assignColors, type SetColors } from './set-colors'
import { buildSyncSets, type TimedNote } from './sync-sets'
import { buildTagSets, type GroupSet } from './tag-sets'

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

/** the colour the cache has for each set of one source and grouping, by set id. */
async function fetchSetColors(source: Source, grouping: string): Promise<SetColors> {
  const { data } = await listSets({ query: { source, grouping }, throwOnError: true })
  return Object.fromEntries(data.map((set) => [set.id, set.color]))
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
 * same source that are no longer in `loaded` are deleted (the cache only marks them deleted).
 * notes that exist but could not be read (`loaded.failed`) are neither pushed nor deleted. the
 * notes are loaded before this runs, so nothing is deleted when loading failed; nothing is
 * deleted either when the cache cannot be listed. afterwards the source's sets are recomputed
 * from what the cache holds and replaced in the cache, even when no note changed, because the
 * `sync` sets move with the clock (see `buildTagSets` and `buildSyncSets`). a set that has no
 * colour yet gets one (see `assignColors`) and keeps it.
 */
export async function syncNotes(
  source: Source,
  loaded: LoadedNotes,
  { baseUrl = DEFAULT_CACHE_URL, fetch: fetchImpl, onProgress, now = new Date() }: SyncOptions = {},
): Promise<SyncResult> {
  configureCacheClient(fetchImpl ? { baseUrl, fetch: fetchImpl } : { baseUrl })

  const { notes, failed } = loaded
  const cached = await fetchCachedNotes(source)
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
  }
  const report = () => onProgress?.({ synced: result.synced, deleted: result.deleted, total })
  report()

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

  await replaceGroupings(source, now)

  return result
}

/** replaces the `tags` and `sync` sets of `source` with what the cache holds now. */
async function replaceGroupings(source: Source, now: Date): Promise<void> {
  // the sync grouping is the one that lists deleted notes; the live ones are the rest.
  const { data: rows } = await listNotes({
    query: { fields: 'synced,created,deleted,source,tags', grouping: 'sync' },
    throwOnError: true,
  })
  const own = rows.filter((row) => row.fields['source'] === source)
  const timed: TimedNote[] = own.map((row) => ({
    id: row.id,
    synced: row.fields['synced'],
    created: row.fields['created'],
    deleted: row.fields['deleted'],
  }))
  const tagged = own
    .filter((row) => row.fields['deleted'] === undefined)
    .map((row) => ({ id: row.id, tags: parseTags(row.fields['tags']) }))

  const tagColors = await fetchSetColors(source, 'tags')
  const tagSets = buildTagSets(tagged, Object.keys(tagColors))
  await replaceSets(source, 'tags', tagSets, tagColors)

  const syncColors = await fetchSetColors(source, 'sync')
  await replaceSets(source, 'sync', buildSyncSets(source, timed, now), syncColors)
}

/** gives the sets without a colour one, then replaces every set in the cache. */
async function replaceSets(
  source: Source,
  grouping: string,
  sets: GroupSet[],
  known: SetColors,
): Promise<void> {
  const colors = {
    ...known,
    ...assignColors(
      known,
      sets.map((set) => set.id),
    ),
  }
  for (const { id, rank, noteIds } of sets) {
    await replaceSet({
      body: { source, grouping, id, color: colors[id] ?? 0, rank, noteIds },
      throwOnError: true,
    })
  }
}
