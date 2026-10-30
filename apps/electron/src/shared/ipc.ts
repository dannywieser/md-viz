// the single source of truth for the ipc contract: main registers handlers for
// these channels, preload forwards them and the renderer sees only `Api`.

import type {
  LastSelection,
  NoteSet,
  ScanProgress,
  ScanResult,
  Source,
  SyncProgress,
  SyncResult,
  SyncTarget,
} from '@md-viz/sync/types'

// the sync package owns these types; they are re-exported so the app imports them from here.
export type {
  LastSelection,
  LastSync,
  NoteRef,
  NoteSet,
  ScanProgress,
  ScanResult,
  Source,
  SyncNotes,
  SyncProgress,
  SyncResult,
  SyncTarget,
} from '@md-viz/sync/types'

export const IPC = {
  pickFolder: 'folder:pick',
  scan: 'source:scan',
  scanProgress: 'source:scan-progress',
  sync: 'source:sync',
  syncProgress: 'source:sync-progress',
  selectSource: 'source:select',
  loadLast: 'source:load-last',
  sets: 'source:sets',
} as const

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
  /** the sets of the `sync` grouping of the source as the cache holds them after the last sync, with their notes. */
  sets: (source: Source) => Promise<NoteSet[]>
}
