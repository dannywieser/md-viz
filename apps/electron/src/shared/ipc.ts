// the single source of truth for the ipc contract: main registers handlers for
// these channels, preload forwards them and the renderer sees only `Api`.

export const IPC = {
  pickFolder: 'folder:pick',
  scanFolder: 'folder:scan',
  scanProgress: 'folder:scan-progress',
  syncFolder: 'folder:sync',
  syncProgress: 'folder:sync-progress',
  loadLast: 'folder:load-last',
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
  mdCount: number
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
  /** markdown files found in the folder. */
  scanned: number
  /** notes pushed because they were new or changed. */
  synced: number
  /** notes skipped because the cache already has a newer copy. */
  unchanged: number
  /** notes removed from the cache because their file is gone. */
  deleted: number
  /** files that could not be read and were left alone. */
  failed: number
  /** the notes behind the counts above. */
  notes: SyncNotes
}

/** the last completed sync of a folder, kept in the app's state file. */
export interface LastSync {
  /** when the sync completed, as an ISO timestamp. */
  syncedAt: string
  notes: SyncNotes
}

/** the folder selected when the app last ran, if it still exists. */
export interface LastFolder {
  folder: string
  lastSync: LastSync | null
}

/** the source and folder selected when the app last ran, with that selection's last sync. */
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
  /** counts markdown files under `path`, recursively. */
  scanFolder: (path: string) => Promise<ScanResult>
  /** subscribes to progress pushed by main during a scan; returns an unsubscribe function. */
  onScanProgress: (callback: (progress: ScanProgress) => void) => () => void
  /** pushes new and changed notes under `path` to the cache and deletes notes whose file is gone. */
  syncFolder: (path: string) => Promise<SyncResult>
  /** the folder from the previous run with its last sync; null when there is none or it is gone. */
  loadLast: () => Promise<LastFolder | null>
  /** subscribes to progress pushed by main during a sync; returns an unsubscribe function. */
  onSyncProgress: (callback: (progress: SyncProgress) => void) => () => void
}
