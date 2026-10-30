export type GridNote = {
  id: string
  title: string
}

export type GridSet = {
  id: string
  /** shown in the grid's bar while one of its notes is hovered. */
  name: string
  /** the set's colour: an index into the note palette. */
  color: number
  notes: GridNote[]
}

/** the notes of the sets as one list, and what the layouts need to know about them. */
export type GridModel = {
  /** the sets that have notes, in the order given. */
  sets: GridSet[]
  /** per natural note (the notes sorted by id, as the cache lists them): the note. */
  notes: GridNote[]
  /** per natural note: its set (an index into `sets`). */
  order: number[]
  /** per set: its number of notes. */
  counts: number[]
}

/**
 * the model of some sets: empty sets are dropped (the layout needs a note in every set), a note
 * listed in several sets stays in the first, and the natural order is by id.
 */
export function buildGridModel(input: GridSet[]): GridModel {
  const seen = new Set<string>()
  const sets: GridSet[] = []
  for (const set of input) {
    const notes = set.notes.filter((note) => !seen.has(note.id) && seen.add(note.id))
    if (notes.length > 0) sets.push({ ...set, notes })
  }
  const flat = sets
    .flatMap((set, index) => set.notes.map((note) => ({ note, index })))
    .sort((a, b) => (a.note.id < b.note.id ? -1 : 1))
  return {
    sets,
    notes: flat.map(({ note }) => note),
    order: flat.map(({ index }) => index),
    counts: sets.map((set) => set.notes.length),
  }
}
