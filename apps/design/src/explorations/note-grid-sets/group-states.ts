import { fillGrid } from './flow-layout'
import { naturalOrder } from './natural-order'
import { fillTileLayout } from './tile-layout'

/** a note's square in px, in the frame of its grid. */
export type Square = { x: number; y: number; size: number }

/** where every note is in one state of the grid. the grid sits in the middle of a fixed frame. */
export type StateLayout = {
  /** px: where the grid starts in the frame (the slack of less than one unit, halved). */
  x0: number
  y0: number
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
  /** px: the frame, the box both states fill; it does not change between them. */
  width: number
  height: number
  /** per natural note: its set. */
  order: number[]
  /** per natural note: its position within its set (the order it has in the grouped state). */
  noteInSet: number[]
  /** the sets as flowing shapes, the squares of the smaller sets bigger (iteration 7, even share). */
  grouped: StateLayout & { owner: number[] }
  /** every note a square of the same size in its natural order, coloured by set. */
  natural: StateLayout
}

/**
 * the two states of the grid for the same notes, so a note can move from one to the other:
 * natural (the notes as listed, one size) and grouped (by set, see `fillTileLayout`). both fill
 * the same `width` x `height` frame, so switching does not change the size of the grid.
 */
export function groupStates(counts: number[], width: number, height: number): GroupStates {
  const order = naturalOrder(counts)
  const total = order.length
  const ids = counts.map(() => [] as number[])
  const noteInSet: number[] = []
  order.forEach((set, id) => {
    noteInSet[id] = ids[set].length
    ids[set].push(id)
  })

  const fit = fillTileLayout(counts, 0, width, height)
  const grouped: GroupStates['grouped'] = {
    x0: Math.floor((width - fit.columns * fit.unit) / 2),
    y0: Math.floor((height - fit.rows * fit.unit) / 2),
    unit: fit.unit,
    columns: fit.columns,
    rows: fit.rows,
    squares: [],
    idAt: fit.tileAt.map((t) => (t === -1 ? -1 : ids[fit.tiles[t].set][fit.tiles[t].note])),
    owner: fit.owner,
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
    x0: Math.floor((width - columns * cell) / 2),
    y0: Math.floor((height - rows * cell) / 2),
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
  return { width, height, order, noteInSet, grouped, natural }
}
