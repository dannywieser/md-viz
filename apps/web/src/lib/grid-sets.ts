import { DEFAULT_NOTE_COLOR } from '@md-viz/ui'
import type { GridNote, GridSet } from '@md-viz/ui'

/** a set of the cache with the ids of its notes. */
export interface CachedSet {
  source: string
  id: string
  color: number
  noteIds: string[]
}

/** a cached note with the fields asked for. */
export interface CachedNote {
  id: string
  fields: Record<string, string>
}

/** the id of the set the notes that are in no set go to. */
export const UNTAGGED = 'untagged'

/**
 * the cache's sets (of one grouping) as the sets of a note grid. a set is named by its id, with
 * its source in front (`bear:daily`) when another source has a set of the same id. a note is
 * titled by its title, else its id; ids a set lists that are not in `notes` (a note since
 * deleted) are left out, and a note listed twice stays in the first set. the notes in no set go to
 * a last grey set, `UNTAGGED`.
 */
export function toGridSets(sets: CachedSet[], notes: CachedNote[]): GridSet[] {
  const titles = new Map<string, GridNote>(
    notes.map((note) => [note.id, { id: note.id, title: note.fields['title'] ?? note.id }]),
  )
  const clash = new Set(
    sets
      .filter((set, i) => sets.some((other, j) => j !== i && other.id === set.id))
      .map((s) => s.id),
  )

  const placed = new Set<string>()
  const result: GridSet[] = sets.map((set) => {
    const members: GridNote[] = []
    for (const id of set.noteIds) {
      const note = titles.get(id)
      if (note && !placed.has(id)) {
        placed.add(id)
        members.push(note)
      }
    }
    return {
      id: `${set.source}:${set.id}`,
      name: clash.has(set.id) ? `${set.source}:${set.id}` : set.id,
      color: set.color,
      notes: members,
    }
  })

  const rest = [...titles.values()].filter((note) => !placed.has(note.id))
  if (rest.length > 0) {
    result.push({ id: UNTAGGED, name: UNTAGGED, color: DEFAULT_NOTE_COLOR, notes: rest })
  }
  return result
}
