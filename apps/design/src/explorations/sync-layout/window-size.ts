/** every grid's column is this wide, as in the app today; the grids' blocks are as wide as their squares. */
export const COLUMN_WIDTH = 272
/** the space between columns. */
export const COLUMN_GAP = 32
/** the page padding either side of the columns. */
export const PAGE_PADDING = 16

/** the redesigned window: fixed, just wide enough for the three columns, and a little shorter than today's. */
export const WINDOW = { width: COLUMN_WIDTH * 3 + COLUMN_GAP * 2 + PAGE_PADDING * 2, height: 520 }

/** the window as it is now. */
export const TODAY_WINDOW = { width: 960, height: 640 }

/** the drawing height a grid with few notes keeps, as today, so its squares stay big (6 notes are 3 wide, 2 tall). */
export const SMALL_GRID_HEIGHT = 160
