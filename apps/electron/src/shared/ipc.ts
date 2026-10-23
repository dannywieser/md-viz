// the single source of truth for the ipc contract: main registers handlers for
// these channels, preload forwards them and the renderer sees only `Api`.

export const IPC = {
  pickFolder: 'folder:pick',
  scanFolder: 'folder:scan',
  scanProgress: 'folder:scan-progress',
  syncFolder: 'folder:sync',
  syncProgress: 'folder:sync-progress',
} as const

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
  /** subscribes to progress pushed by main during a sync; returns an unsubscribe function. */
  onSyncProgress: (callback: (progress: SyncProgress) => void) => () => void
}
