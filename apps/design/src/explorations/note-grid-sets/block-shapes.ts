/** how a set of n notes becomes a block of whole cells. */
export type SizeRule = 'round' | 'ceil' | 'rectangle'

export const SIZE_RULES: SizeRule[] = ['round', 'ceil', 'rectangle']

/** a block of whole cells. */
export type Shape = { columns: number; rows: number }

/**
 * the block for `count` notes: `round` and `ceil` are squares with the rounded or rounded-up side
 * of sqrt(count) (49 or 64 cells for 50 notes); `rectangle` is the near-square rectangle that holds
 * at least `count` cells (8 x 7 for 50). every side is a whole number of cells, so with a whole-px
 * cell every corner of a block is on a dot of the lattice.
 */
export function blockShape(count: number, rule: SizeRule): Shape {
  const n = Math.max(1, count)
  if (rule === 'round') {
    const side = Math.max(1, Math.round(Math.sqrt(n)))
    return { columns: side, rows: side }
  }
  const columns = Math.ceil(Math.sqrt(n))
  if (rule === 'ceil') return { columns, rows: columns }
  return { columns, rows: Math.ceil(n / columns) }
}

/** the outline (an svg path) of `count` squares of `cell` px filled row by row into `columns` columns: a rectangle with a short last row. */
export function groupOutline(count: number, columns: number, cell: number): string {
  const width = Math.min(count, columns)
  const fullRows = Math.floor(count / columns)
  const rest = count - fullRows * columns
  const w = width * cell
  if (rest === 0) return `M0,0H${w}V${fullRows * cell}H0Z`
  if (fullRows === 0) return `M0,0H${w}V${cell}H0Z`
  return `M0,0H${w}V${fullRows * cell}H${rest * cell}V${(fullRows + 1) * cell}H0Z`
}
