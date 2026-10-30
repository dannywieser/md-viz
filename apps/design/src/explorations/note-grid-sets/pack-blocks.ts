import type { Shape } from './block-shapes'

/** where a block sits, in cells from the top-left of the grid. */
export type Placement = Shape & { x: number; y: number }

export type Packing = { placements: Placement[]; rows: number }

/**
 * packs blocks left to right in rows (shelves) within `widthCells`; a block that does not fit the
 * rest of a row starts a new one, and a row is as tall as its tallest block. keeps the input order
 * (sort largest first beforehand to pack tightly). a block wider than the grid sits at the left edge.
 */
export function packBlocks(shapes: Shape[], widthCells: number): Packing {
  const placements: Placement[] = []
  let x = 0
  let y = 0
  let shelf = 0
  for (const shape of shapes) {
    if (x > 0 && x + shape.columns > widthCells) {
      y += shelf
      x = 0
      shelf = 0
    }
    placements.push({ ...shape, x, y })
    x += shape.columns
    shelf = Math.max(shelf, shape.rows)
  }
  return { placements, rows: y + shelf }
}

/** the largest whole-px cell at which the packed blocks fit a width x height box (1 when none does). */
export function largestCell(shapes: Shape[], width: number, height: number): number {
  for (let cell = Math.floor(Math.min(width, height)); cell > 1; cell--) {
    const { rows } = packBlocks(shapes, Math.floor(width / cell))
    if (rows * cell <= height) return cell
  }
  return 1
}

/** the block under cell (column, row), or -1. */
export function blockAt(placements: Placement[], column: number, row: number): number {
  return placements.findIndex(
    (p) => column >= p.x && column < p.x + p.columns && row >= p.y && row < p.y + p.rows,
  )
}

export type UniformLayout = { columns: number; rows: number; cell: number }

/** the largest whole-px cell at which `count` equal squares fit a width x height box, filled row by row (1px cells overflow rather than drop notes). */
export function uniformLayout(count: number, width: number, height: number): UniformLayout {
  for (let cell = Math.floor(Math.min(width, height)); cell > 1; cell--) {
    const columns = Math.max(1, Math.floor(width / cell))
    const rows = Math.ceil(count / columns)
    if (rows * cell <= height) return { columns, rows, cell }
  }
  const columns = Math.max(1, Math.floor(width))
  return { columns, rows: Math.ceil(count / columns), cell: 1 }
}
