import type { Source } from '../types'
import { buildSyncSets, type TimedNote } from './sync-sets'
import { buildTagSets, type GroupSet } from './tag-sets'

/** a cached note of one source as far as any grouping is concerned. */
export interface CachedGroupNote extends TimedNote {
  /** the note's tags as the source lists them. */
  tags: string[]
}

export interface GroupingInput {
  source: Source
  /** every cached note of `source`, deleted ones included (they carry a `deleted` time). */
  notes: CachedGroupNote[]
  /** the ids of the sets of this grouping the cache already holds. */
  known: string[]
  /** the time the sets are computed at; the PC's clock unless a test sets it. */
  now: Date
}

/** a way to group the notes of a source into sets: the facet an app colours and groups by. */
export interface Grouping {
  /** the `grouping` field of its sets in the cache. */
  name: string
  /** the sets of this grouping, whole: the sync replaces each one it returns. */
  build: (input: GroupingInput) => GroupSet[]
}

/**
 * every grouping the sync fills, in the order it fills them. a new grouping is one entry here and
 * its builder; `syncNotes` runs them all the same way (colours, ranks and the cache calls included).
 */
export const GROUPINGS: readonly Grouping[] = [
  {
    name: 'tags',
    build: ({ notes, known }) =>
      buildTagSets(
        notes.filter((note) => note.deleted === undefined),
        known,
      ),
  },
  {
    name: 'sync',
    build: ({ source, notes, now }) => buildSyncSets(source, notes, now),
  },
]
