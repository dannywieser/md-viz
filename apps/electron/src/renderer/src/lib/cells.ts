import { tagColorIndexes, type Note } from '@md-viz/ui'
import type { NoteRef, TagColors } from '../../../shared/ipc'

/** the notes of a sync as grid notes: coloured by the top level of their tags (a tag with no colour is left out of the stripes but still listed in the tooltip). */
export function toCells(notes: NoteRef[], tagColors: TagColors): Note[] {
  return notes.map((note) => ({
    id: note.id,
    title: note.title,
    colors: tagColorIndexes(note.tags, (tag) =>
      Object.hasOwn(tagColors, tag) ? tagColors[tag] : undefined,
    ),
    tags: note.tags,
  }))
}
