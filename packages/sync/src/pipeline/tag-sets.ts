import { topLevelTag } from './set-colors'

/** a set the sync works out: its id within the grouping, its order and its members. */
export interface GroupSet {
  id: string
  /** order within the grouping, lower first. */
  rank: number
  noteIds: string[]
}

/** a cached note as far as the tag sets are concerned. */
export interface TaggedNote {
  id: string
  tags: string[]
}

/**
 * the sets of the `tags` grouping: one per top-level tag (`daily` for `daily/10/28`) holding the
 * notes that have it, ordered by id. `known` are the tag sets the cache already has: one whose
 * tag no note has any more is returned empty, so its colour is kept for the day the tag comes back.
 */
export function buildTagSets(notes: TaggedNote[], known: string[]): GroupSet[] {
  const members = new Map<string, string[]>(known.map((id) => [id, []]))
  for (const note of notes) {
    for (const tag of new Set(note.tags.map(topLevelTag))) {
      members.set(tag, [...(members.get(tag) ?? []), note.id])
    }
  }
  return [...members]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([id, noteIds]) => ({ id, rank: 0, noteIds }))
}
