export type GridLayoutInput = {
  count: number
  width: number
  height: number
  /** optional upper bound for the cell. */
  maxCell?: number
  /** optional: only use whole multiples of this cell, so several grids share one lattice. Ignored when not even one multiple fits. */
  multipleOf?: number
}

export type GridLayout = {
  columns: number
  rows: number
  /** side of one square cell, in whole px. */
  cell: number
}

function rowsFor(count: number, width: number, cell: number) {
  const columns = Math.max(1, Math.min(Math.floor(width / cell), count))
  return { columns, rows: Math.ceil(count / columns) }
}

/** the largest cell, a whole multiple of `unit` and at most `limit`, for which `count` cells fit; 0 when even `unit` is over the limit. */
function largestFit(count: number, width: number, height: number, limit: number, unit: number) {
  let low = 0
  let high = Math.floor(limit / unit)
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    const { rows } = rowsFor(count, width, mid * unit)
    if (rows * mid * unit <= height) low = mid
    else high = mid - 1
  }
  return low * unit
}

/**
 * Picks the largest whole-pixel cell for which `count` equal cells fit in a width x height box.
 * Cells shrink as the count grows so every note stays visible. When even a 1px cell cannot hold
 * the count the grid overflows the height rather than dropping notes. With `multipleOf` the cell is
 * the largest whole multiple of it that fits, falling back to any whole pixel when none does.
 */
export function layoutGrid({
  count,
  width,
  height,
  maxCell = Infinity,
  multipleOf,
}: GridLayoutInput): GridLayout {
  const limit = Math.max(1, Math.min(Math.floor(width), Math.floor(height), maxCell))
  if (multipleOf !== undefined && multipleOf >= 1) {
    const cell = largestFit(count, width, height, limit, Math.floor(multipleOf))
    if (cell > 0) return { ...rowsFor(count, width, cell), cell }
  }
  const cell = largestFit(count, width, height, limit, 1) || 1
  return { ...rowsFor(count, width, cell), cell }
}

/**
 * dot spacing for a grid with this cell, always landing on cell corners: a whole multiple of the
 * cell when it is smaller than `min`, an even division of it when larger than `max`, else the cell.
 */
export function latticeSpacing(cell: number, min = 16, max = 32) {
  if (cell > max) return cell / Math.ceil(cell / max)
  return cell * Math.max(1, Math.ceil(min / cell))
}

/** the grid's own stroke room: squares sit 1.5px in from the svg edge on each side. */
export const STROKE_ROOM = 3

/** the size (px) of the block a grid of `count` notes makes in a width x height drawing area, stroke room included. */
export function gridBlockSize({ count, width, height }: GridLayoutInput) {
  const { columns, rows, cell } = layoutGrid({
    count,
    width: Math.max(0, width - STROKE_ROOM),
    height: Math.max(0, height - STROKE_ROOM),
  })
  return { width: columns * cell + STROKE_ROOM, height: rows * cell + STROKE_ROOM }
}
