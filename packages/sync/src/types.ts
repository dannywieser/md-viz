// the types the sync package shares with its callers. this file imports nothing from node,
// so a browser-side tsconfig can type-check it (import it as `@md-viz/sync/types`).

/** where notes come from: a folder of markdown files or the Bear app. */
export type Source = 'file' | 'bear'

/** what a scan or sync runs on: a file source needs its folder, Bear needs nothing. */
export type SyncTarget = FileTarget | BearTarget

/** the target of the file source: the folder of markdown files. */
export interface FileTarget {
  source: 'file'
  folder: string
}

/** the target of the Bear source: the Bear library needs nothing else. */
export interface BearTarget {
  source: 'bear'
}

export interface ScanProgress {
  /** directories visited so far. */
  dirs: number
  /** markdown files found so far. */
  mdFiles: number
}

export interface ScanResult {
  /** notes the source holds: markdown files, or Bear notes that are neither trashed nor locked. */
  count: number
}

export interface SyncProgress {
  /** notes pushed to the cache so far. */
  synced: number
  /** notes deleted from the cache so far. */
  deleted: number
  /** notes to push plus notes to delete in this sync. */
  total: number
}

export interface NoteRef {
  id: string
  title: string
  /** the note's tags as the sync saw them. */
  tags: string[]
}

/** the notes of one sync, by what happened to them; unreadable files are in none of the lists. */
export interface SyncNotes {
  updated: NoteRef[]
  deleted: NoteRef[]
  unchanged: NoteRef[]
}

export interface SyncResult {
  /** notes found in the source: markdown files in the folder, or Bear notes. */
  scanned: number
  /** notes pushed because they were new or changed. */
  synced: number
  /** notes skipped because the cache already has a newer copy. */
  unchanged: number
  /** notes removed from the cache because the source no longer has them. */
  deleted: number
  /** notes that could not be read and were left alone. */
  failed: number
  /** the notes behind the counts above. */
  notes: SyncNotes
}

/** the last completed sync of a source (of a folder, for files), kept in the app's state file. */
export interface LastSync {
  /** when the sync completed, as an ISO timestamp. */
  syncedAt: string
  notes: SyncNotes
}

/** a source with the folder chosen for it and the last sync of that selection. */
export interface LastSelection {
  source: Source
  /** the last folder chosen for the file source, if it still exists; null for Bear. */
  folder: string | null
  lastSync: LastSync | null
}
