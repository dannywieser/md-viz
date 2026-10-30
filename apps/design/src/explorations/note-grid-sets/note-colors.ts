import { DEFAULT_NOTE_COLOR } from '@md-viz/ui'
import { SET_COLOR, TAG_COLOR, type SampleNote } from './sample-sets'

/** what a note's colours come from. */
export type ColorMode = 'set' | 'tag'

/** a square shows at most this many stripes. */
export const MAX_STRIPES = 3

/** a palette colour as css; the theme sets `--note-0..24`, so the grid follows the theme switcher. */
export const colorVar = (index: number) => `var(--note-${index})`

/** the palette indexes of a note's first MAX_STRIPES sets or tags; the neutral grey when it has none. */
export function noteColorIndexes(note: SampleNote, mode: ColorMode): number[] {
  const indexes =
    mode === 'set' ? note.sets.map((id) => SET_COLOR[id]) : note.tags.map((tag) => TAG_COLOR[tag])
  return indexes.length === 0 ? [DEFAULT_NOTE_COLOR] : indexes.slice(0, MAX_STRIPES)
}

/** the heights (whole px) of `count` stripes that fill `size` px; the first stripes take the leftover px. */
export function stripeHeights(size: number, count: number): number[] {
  const base = Math.floor(size / count)
  const extra = size - base * count
  return Array.from({ length: count }, (_, i) => base + (i < extra ? 1 : 0))
}
