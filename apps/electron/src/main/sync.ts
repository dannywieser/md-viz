import { createHash } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { configureCacheClient, deleteNote, listNotes, upsertNotes } from '@md-viz/api-client/cache'
import type { NoteRef, SyncProgress, SyncResult } from '../shared/ipc'
import { walkMarkdown } from './walk'

export const DEFAULT_CACHE_URL = 'http://localhost:8787'

const BATCH_SIZE = 200
const DELETE_CONCURRENCY = 20

export interface SyncOptions {
  baseUrl?: string
  /** replaces the global fetch, for tests. */
  fetch?: typeof fetch
  onProgress?: (progress: SyncProgress) => void
}

/** the cache id of a note: a short, stable, slash-free hash of its path relative to the folder. */
export function noteId(relativePath: string): string {
  return createHash('sha256').update(relativePath).digest('hex').slice(0, 16)
}

/** the note title: the file name without its `.md` extension. */
export function noteTitle(relativePath: string): string {
  return path.posix.basename(relativePath).replace(/\.md$/i, '')
}

interface LocalNote {
  id: string
  absolutePath: string
  relativePath: string
  mtimeMs: number
}

interface CachedNote {
  title: string
  /** NaN when the note has no usable `synced`. */
  synced: number
}

/** reads the cached notes' titles and sync times, by id. */
async function fetchCachedNotes(): Promise<Map<string, CachedNote>> {
  const { data: rows } = await listNotes({
    query: { fields: 'synced,title' },
    throwOnError: true,
  })
  return new Map(
    rows.map((row) => [
      row.id,
      { title: row.fields['title'] ?? row.id, synced: Date.parse(row.fields['synced'] ?? '') },
    ]),
  )
}

/** walks `root` and returns its markdown files by note id, with their modification times. */
async function collectLocalNotes(root: string): Promise<Map<string, LocalNote>> {
  const local = new Map<string, LocalNote>()
  for await (const file of walkMarkdown(root)) {
    let mtimeMs: number
    try {
      mtimeMs = (await stat(file.absolutePath)).mtimeMs
    } catch {
      continue
    }
    const id = noteId(file.relativePath)
    local.set(id, { id, ...file, mtimeMs })
  }
  return local
}

/**
 * a note needs pushing when the cache has never seen it or the file was modified after the
 * cache's last sync. `synced` is stamped in whole milliseconds, so the mtime is floored to
 * compare like with like.
 */
function needsPush(note: LocalNote, cached: Map<string, CachedNote>): boolean {
  const synced = cached.get(note.id)?.synced
  return synced === undefined || Number.isNaN(synced) || Math.floor(note.mtimeMs) > synced
}

/**
 * reads one batch of files and upserts them in a single request. files that cannot be read
 * are skipped; returns the notes that were pushed and how many files failed.
 */
async function pushBatch(batch: LocalNote[]): Promise<{ pushed: LocalNote[]; failed: number }> {
  const notes = []
  const pushed: LocalNote[] = []
  let failed = 0
  for (const note of batch) {
    try {
      const body = await readFile(note.absolutePath, 'utf8')
      notes.push({ id: note.id, fields: { title: noteTitle(note.relativePath), body } })
      pushed.push(note)
    } catch {
      failed += 1
    }
  }
  if (notes.length > 0) await upsertNotes({ body: { notes }, throwOnError: true })
  return { pushed, failed }
}

/**
 * pushes the markdown notes under `root` to the cache: new and changed files
 * (mtime newer than the cached `synced`) are upserted in batches, and cached
 * notes with no file are deleted. nothing is deleted unless the cache listing
 * and the folder walk both succeeded.
 */
export async function syncFolder(
  root: string,
  { baseUrl = DEFAULT_CACHE_URL, fetch: fetchImpl, onProgress }: SyncOptions = {},
): Promise<SyncResult> {
  configureCacheClient(fetchImpl ? { baseUrl, fetch: fetchImpl } : { baseUrl })

  // an unreadable folder would look empty and wipe the cache, so fail before walking.
  await readdir(root)

  // compare what the cache has with what is on disk.
  const cached = await fetchCachedNotes()
  const local = await collectLocalNotes(root)
  const changed = [...local.values()].filter((note) => needsPush(note, cached))
  const changedIds = new Set(changed.map((note) => note.id))
  const gone = [...cached.keys()].filter((id) => !local.has(id))
  const ref = (note: LocalNote): NoteRef => ({ id: note.id, title: noteTitle(note.relativePath) })

  const total = changed.length + gone.length
  const result: SyncResult = {
    scanned: local.size,
    synced: 0,
    unchanged: local.size - changed.length,
    deleted: 0,
    failed: 0,
    notes: {
      updated: [],
      deleted: [],
      unchanged: [...local.values()].filter((note) => !changedIds.has(note.id)).map(ref),
    },
  }
  const report = () => onProgress?.({ synced: result.synced, deleted: result.deleted, total })
  report()

  // push new and changed notes, one batch per request.
  for (let i = 0; i < changed.length; i += BATCH_SIZE) {
    const { pushed, failed } = await pushBatch(changed.slice(i, i + BATCH_SIZE))
    result.synced += pushed.length
    result.notes.updated.push(...pushed.map(ref))
    result.failed += failed
    report()
  }

  // remove notes whose file is gone, a few requests at a time.
  for (let i = 0; i < gone.length; i += DELETE_CONCURRENCY) {
    const ids = gone.slice(i, i + DELETE_CONCURRENCY)
    await Promise.all(ids.map((id) => deleteNote({ path: { id }, throwOnError: true })))
    result.deleted += ids.length
    result.notes.deleted.push(...ids.map((id) => ({ id, title: cached.get(id)?.title ?? id })))
    report()
  }

  return result
}
