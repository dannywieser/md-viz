import type { Source } from '../types'

/** a note from any source, the one shape the sync pipeline works with. */
export interface Note {
  /** the cache id: unique across sources. */
  id: string
  source: Source
  title: string
  body: string
  tags: string[]
  /** when the note was created, as an ISO timestamp; empty when the source does not know. */
  created: string
  /** when the note last changed, as an ISO timestamp. */
  modified: string
}

/** the note as cache fields: the cache stores strings only, so the tags are a JSON array. */
export function noteToFields(note: Note): Record<string, string> {
  return {
    title: note.title,
    body: note.body,
    tags: JSON.stringify(note.tags),
    created: note.created,
    modified: note.modified,
    source: note.source,
  }
}
