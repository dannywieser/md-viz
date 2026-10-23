export const GRID_HEIGHT = 160
// every status gets a column this wide, empty or not.
export const COLUMN_WIDTH = 272
// the least space between columns; widened so the column pitch is a whole number of dot spacings.
export const MIN_GAP = 32
// every note gets the same color until color carries meaning.
export const NOTE_COLOR = 0

export const GROUPS = ['updated', 'deleted', 'unchanged'] as const
export type Group = (typeof GROUPS)[number]
