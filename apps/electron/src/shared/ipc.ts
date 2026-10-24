// the single source of truth for the ipc contract: main registers handlers for
// these channels, preload forwards them and the renderer sees only `Api`.

export const IPC = {
  pickFolder: 'folder:pick',
  scan: 'source:scan',
  scanProgress: 'source:scan-progress',
  sync: 'source:sync',
  syncProgress: 'source:sync-progress',
  selectSource: 'source:select',
  loadLast: 'source:load-last',
} as const

/** where notes come from: a folder of markdown files or the Bear app. */
export type Source = 'file' | 'bear'

/** what a scan or sync runs on: a file source needs its folder, Bear needs nothing. */
export type SyncTarget = { source: 'file'; folder: string } | { source: 'bear' }

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

/** what the preload script exposes to the renderer as `window.api`. */
export interface Api {
  /** opens the native folder dialog; resolves to null when cancelled. */
  pickFolder: () => Promise<string | null>
  /** counts the notes of the source: markdown files under the folder, or the Bear notes. */
  scan: (target: SyncTarget) => Promise<ScanResult>
  /** subscribes to progress pushed by main during a scan; returns an unsubscribe function. */
  onScanProgress: (callback: (progress: ScanProgress) => void) => () => void
  /** pushes the source's new and changed notes to the cache and deletes the ones it no longer has. */
  sync: (target: SyncTarget) => Promise<SyncResult>
  /** subscribes to progress pushed by main during a sync; returns an unsubscribe function. */
  onSyncProgress: (callback: (progress: SyncProgress) => void) => () => void
  /** remembers `source` as the selected one and returns its folder and last sync. */
  selectSource: (source: Source) => Promise<LastSelection>
  /** the selection from the previous run; a file source's folder is null once it is gone. */
  loadLast: () => Promise<LastSelection>
}
