/** a made-up, customisable set: sets are whatever the user defines, so these are only named a, b, c... */
export type SampleSet = { id: string; name: string; color: number }

/** a made-up note: its sets (the first is its own, the rest only matter where notes may stripe several) and its tags. */
export type SampleNote = { id: string; title: string; sets: string[]; tags: string[] }

/** (name, notes) of the sets, from the biggest to a set of one note. */
const SET_SIZES: [string, number][] = [
  ['set a', 120],
  ['set b', 50],
  ['set c', 23],
  ['set d', 12],
  ['set e', 9],
  ['set f', 4],
  ['set g', 1],
]

export const SAMPLE_SETS: SampleSet[] = SET_SIZES.map(([name], color) => ({
  id: name.replace(' ', '-'),
  name,
  color,
}))

export const SAMPLE_TAGS = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta']

/** palette index of a set / tag, by id / name. */
export const SET_COLOR: Record<string, number> = Object.fromEntries(
  SAMPLE_SETS.map((set) => [set.id, set.color]),
)
export const TAG_COLOR: Record<string, number> = Object.fromEntries(
  SAMPLE_TAGS.map((tag, i) => [tag, i]),
)

/** every n-th note has no tags. */
const UNTAGGED_EVERY = 7
const TAG_COUNTS = [1, 2, 1, 3, 2, 1]

function makeNotes(): SampleNote[] {
  const notes: SampleNote[] = []
  SET_SIZES.forEach(([name], setIndex) => {
    const own = SAMPLE_SETS[setIndex].id
    for (let k = 0; k < SET_SIZES[setIndex][1]; k++) {
      const sets = [own]
      // some notes also belong to the next sets (cyclic), to show striping by set
      if (k % 5 === 4) sets.push(SAMPLE_SETS[(setIndex + 1) % SAMPLE_SETS.length].id)
      if (k % 15 === 14) sets.push(SAMPLE_SETS[(setIndex + 2) % SAMPLE_SETS.length].id)
      const tagCount =
        k % UNTAGGED_EVERY === UNTAGGED_EVERY - 1 ? 0 : TAG_COUNTS[k % TAG_COUNTS.length]
      const tags = Array.from(
        { length: tagCount },
        (_, j) => SAMPLE_TAGS[(k * 3 + j * 5 + setIndex) % SAMPLE_TAGS.length],
      )
      notes.push({ id: `${own}-${k + 1}`, title: `${name} note ${k + 1}`, sets, tags })
    }
  })
  return notes
}

/** the notes, grouped by their own set, biggest set first. */
export const SAMPLE_NOTES: SampleNote[] = makeNotes()

/** how many notes have `setId` as their own (first) set. */
export function setCount(setId: string): number {
  return SAMPLE_NOTES.filter((note) => note.sets[0] === setId).length
}
