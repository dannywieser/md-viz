import type { Note } from '../pipeline/notes'
import type { ScanProgress, ScanResult, SyncTarget } from '../types'

export interface LoadedNotes {
  notes: Note[]
  /** ids of notes that exist in the source but could not be read; they are left out of `notes`. */
  failed: string[]
}

/**
 * what every source offers the rest of the package: read its notes and count them. a source
 * folder exports one adapter from its `index.ts` and keeps everything else private.
 */
export interface SourceAdapter<T extends SyncTarget> {
  /** reads the notes of `target`; fails when the source cannot be read at all. */
  load: (target: T) => Promise<LoadedNotes>
  /** counts the notes `load` would return, reporting progress where the source can. */
  scan: (target: T, onProgress?: (progress: ScanProgress) => void) => Promise<ScanResult>
}
