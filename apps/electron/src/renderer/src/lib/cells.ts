import type { GridNote } from '@md-viz/ui'
import type { NoteRef } from '../../../shared/ipc'

/** the notes of a sync as grid notes. */
export function toCells(notes: NoteRef[]): GridNote[] {
  return notes.map((note) => ({ id: note.id, title: note.title }))
}
