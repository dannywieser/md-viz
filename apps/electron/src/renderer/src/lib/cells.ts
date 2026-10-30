import type { Note } from '@md-viz/ui'
import type { NoteRef } from '../../../shared/ipc'

/** the notes of a sync as grid notes. no colours for now: tag colours are gone and the grids get their colours from the cache's sets in a later change; the tooltip still lists the tags. */
export function toCells(notes: NoteRef[]): Note[] {
  return notes.map((note) => ({ id: note.id, title: note.title, colors: [], tags: note.tags }))
}
