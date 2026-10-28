import { HUE_COLORS, NEUTRAL_INDEX } from './derive-note-colors'

const TAG_COUNTS = [1, 1, 2, 3, 1, 2, 4, 1]

/** every n-th note has no tags. */
const UNTAGGED_EVERY = 7

/**
 * colour indexes of `count` made-up notes, one list per note: one to three colours (a fourth tag
 * is dropped, as the grid shows the first three) or the neutral one for an untagged note.
 */
export function sampleNotes(count: number): number[][] {
  return Array.from({ length: count }, (_, i) => {
    if (i % UNTAGGED_EVERY === UNTAGGED_EVERY - 1) return [NEUTRAL_INDEX]
    const tags = TAG_COUNTS[i % TAG_COUNTS.length]
    return Array.from({ length: Math.min(tags, 3) }, (_, j) => (i * 7 + j * 5 + 3) % HUE_COLORS)
  })
}
