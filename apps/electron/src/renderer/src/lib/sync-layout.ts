import { COLUMN_GAP, COLUMN_WIDTH } from '../../../shared/window-size'

export const GROUPS = ['updated', 'deleted', 'unchanged'] as const
export type Group = (typeof GROUPS)[number]

/** the drawing height (px) of a grid with few notes, so its squares stay big: 6 notes are 3 wide and 2 tall. */
export const SMALL_GRID_HEIGHT = 160
/** a grid with this many notes or fewer keeps the small height. */
export const SMALL_GRID_NOTES = 12
/** the least gap (px) a column keeps when it is moved onto the dot lattice. */
export const MIN_GAP = 16

/** the drawing height of a grid of `count` notes: small for a few, else undefined to fill the height it is given. */
export const gridHeight = (count: number) =>
  count <= SMALL_GRID_NOTES ? SMALL_GRID_HEIGHT : undefined

/**
 * the distance (px) between the left edges of two columns. the columns have a fixed width in a
 * fixed window, so the pitch is the largest whole number of dot spacings that leaves at least
 * MIN_GAP and fits; when none does, the plain gap is used and the columns are off the dots.
 */
export function columnPitch(spacing: number | undefined) {
  const plain = COLUMN_WIDTH + COLUMN_GAP
  if (!spacing) return plain
  const pitch = Math.floor(plain / spacing) * spacing
  return pitch - COLUMN_WIDTH >= MIN_GAP ? pitch : plain
}
