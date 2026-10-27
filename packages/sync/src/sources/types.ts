import type { Note } from '../pipeline/notes'
import type { AppState } from '../state'
import type { ScanProgress, ScanResult, SyncTarget } from '../types'

export interface LoadedNotes {
  notes: Note[]
  /** ids of notes that exist in the source but could not be read; they are left out of `notes`. */
  failed: string[]
}

/**
 * everything the rest of the package needs from a source, so none of it names a source. a source
 * folder exports one adapter from its `index.ts` and keeps everything else private.
 */
export interface SourceAdapter<T extends SyncTarget> {
  /** reads the notes of `target`; fails when the source cannot be read at all. */
  load: (target: T) => Promise<LoadedNotes>
  /** counts the notes `load` would return, reporting progress where the source can. */
  scan: (target: T, onProgress?: (progress: ScanProgress) => void) => Promise<ScanResult>
  /** checks a raw target that names this source and returns it typed; throws when it is invalid. */
  parse: (input: Record<string, unknown>) => Promise<T>
  /** the key of the target's last sync in the state file. */
  key: (target: T) => string
  /** records in `state` what the source needs to bring `target` back (`lastSource` is set by the caller). */
  remember: (state: AppState, target: T) => void
  /** the target `state` remembers, or null when there is none or it is no longer valid. */
  restore: (state: AppState) => Promise<T | null>
}
