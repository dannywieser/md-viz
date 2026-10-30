import { fillGrid, ownerOutline } from './grid-geometry'
import { fillTileLayout } from './tile-layout'

/** a note's square in px, in the frame of its grid. */
export type Square = { x: number; y: number; size: number }

/** where every note is in one state of the grid. the grid is `columns * unit` x `rows * unit` px, from the corner of its block. */
export type StateLayout = {
  /** px: the cell the grid's squares are built from (the pointer reads the grid in these). */
  unit: number
  columns: number
  rows: number
  /** per natural note. */
  squares: Square[]
  /** per cell of the grid, row by row: the natural note over it, -1 when empty. */
  idAt: number[]
}

export type GroupStates = {
  /** px: the frame, the box both states are fitted to; each state is up to one unit smaller than it. */
  width: number
  height: number
  /** per natural note: its set. */
  order: number[]
  /** the sets as flowing shapes, the squares of the smaller sets bigger. */
  grouped: StateLayout & { outline: string }
  /** every note a square of the same size in its natural order, coloured by set. */
  natural: StateLayout
}

/**
 * the two states of the grid for the same notes, so a note can move from one to the other:
 * natural (the notes as listed, one size) and grouped (by set, see `fillTileLayout`). `order` is
 * the set of each natural note and `counts` the notes of each set. both fill the same `width` x
 * `height` frame, each as big as fits in it (the slack of less than one unit is left out, not
 * split around the grid), so the two states can be a little different in size.
 */
export function groupStates(
  counts: number[],
  order: number[],
  width: number,
  height: number,
): GroupStates {
  const total = order.length
  const ids = counts.map(() => [] as number[])
  order.forEach((set, id) => ids[set].push(id))

  const fit = fillTileLayout(counts, width, height)
  const grouped: GroupStates['grouped'] = {
    unit: fit.unit,
    columns: fit.columns,
    rows: fit.rows,
    squares: [],
    idAt: fit.tileAt.map((t) => (t === -1 ? -1 : ids[fit.tiles[t].set][fit.tiles[t].note])),
    outline: ownerOutline(fit.owner, fit.columns, fit.rows, fit.unit),
  }
  for (const tile of fit.tiles) {
    grouped.squares[ids[tile.set][tile.note]] = {
      x: tile.x * fit.unit,
      y: tile.y * fit.unit,
      size: tile.size * fit.unit,
    }
  }

  const { cell, columns, rows } = fillGrid(total, width, height)
  const natural: StateLayout = {
    unit: cell,
    columns,
    rows,
    squares: order.map((_, id) => ({
      x: (id % columns) * cell,
      y: Math.floor(id / columns) * cell,
      size: cell,
    })),
    idAt: Array.from({ length: columns * rows }, (_, i) => (i < total ? i : -1)),
  }
  return { width, height, order, grouped, natural }
}
