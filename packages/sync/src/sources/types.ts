import type { Note } from '../pipeline/notes'

export interface LoadedNotes {
  notes: Note[]
  /** ids of notes that exist in the source but could not be read; they are left out of `notes`. */
  failed: string[]
}
