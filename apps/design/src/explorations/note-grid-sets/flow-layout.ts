export type FlowFit = {
  /** px: every square is the same size, whole px. */
  cell: number
  columns: number
  rows: number
  /** per cell, row by row: the index of the set that holds it, -1 when empty. */
  owner: number[]
  /** per cell, row by row: the position of the note within its set. */
  note: number[]
}

/**
 * a `columns` x `rows` grid (px: `cell` each) for `total` notes whose cells are all used when
 * possible: of the pairs of whole numbers whose product is `total`, the one that gives the biggest
 * square in the box (the one that leaves the least of the box unused on a tie). when no pair gives
 * a square of at least 3px, the grid is nearly square and the last cells are empty.
 */
export function chooseGrid(
  total: number,
  width: number,
  height: number,
): { cell: number; columns: number; rows: number } {
  let best: { cell: number; columns: number; rows: number; unused: number } | null = null
  for (let columns = 1; columns <= total; columns++) {
    if (total % columns !== 0) continue
    const rows = total / columns
    const cell = Math.min(Math.floor(width / columns), Math.floor(height / rows))
    const unused = width * height - total * cell * cell
    if (cell >= 3 && (!best || cell > best.cell || (cell === best.cell && unused < best.unused)))
      best = { cell, columns, rows, unused }
  }
  if (best) return { cell: best.cell, columns: best.columns, rows: best.rows }
  const columns = Math.max(1, Math.ceil(Math.sqrt((total * width) / height)))
  const rows = Math.ceil(total / columns)
  const cell = Math.max(1, Math.min(Math.floor(width / columns), Math.floor(height / rows)))
  return { cell, columns, rows }
}

/**
 * a grid of squares as big as possible (whole px) that holds `total` notes and fills the box: as
 * many columns and rows as fit (the slack is less than one square), the cells past the last note
 * empty.
 */
export function fillGrid(
  total: number,
  width: number,
  height: number,
): { cell: number; columns: number; rows: number } {
  for (let cell = Math.min(width, height); cell >= 1; cell--) {
    const columns = Math.floor(width / cell)
    const rows = Math.floor(height / cell)
    if (columns * rows >= total) return { cell, columns, rows }
  }
  return { cell: 1, columns: width, rows: Math.ceil(total / width) }
}

/**
 * fills a grid with the sets without any filler: the notes are laid along a snake path through
 * the cells (down the first column, up the second, ... or, with `byRows`, along the rows), set
 * after set, so each set is one run of the path: a band across the grid with a ragged end where
 * the next set begins. the path never jumps, so every set is one connected shape.
 */
export function flowLayout(
  counts: number[],
  width: number,
  height: number,
  byRows = false,
): FlowFit {
  const total = counts.reduce((sum, count) => sum + count, 0)
  const { cell, columns, rows } = chooseGrid(total, width, height)
  const owner = Array.from({ length: columns * rows }, () => -1)
  const note = Array.from({ length: columns * rows }, () => 0)
  const lane = byRows ? columns : rows
  let position = 0
  counts.forEach((count, set) => {
    for (let k = 0; k < count; k++, position++) {
      const outer = Math.floor(position / lane)
      const inner = outer % 2 === 0 ? position % lane : lane - 1 - (position % lane)
      const index = byRows ? outer * columns + inner : inner * columns + outer
      owner[index] = set
      note[index] = k
    }
  })
  return { cell, columns, rows, owner, note }
}

/** the edges between cells of different sets (and of a set and the outside) as one path, in px. */
export function ownerOutline(owner: number[], columns: number, rows: number, cell: number): string {
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= columns || y >= rows ? -2 : owner[y * columns + x]
  const edge = (a: number, b: number) => a !== b && (a >= 0 || b >= 0)
  const parts: string[] = []
  for (let x = 0; x <= columns; x++) {
    let start = -1
    for (let y = 0; y <= rows; y++) {
      const on = y < rows && edge(at(x - 1, y), at(x, y))
      if (on && start < 0) start = y
      if (!on && start >= 0) {
        parts.push(`M${x * cell},${start * cell}V${y * cell}`)
        start = -1
      }
    }
  }
  for (let y = 0; y <= rows; y++) {
    let start = -1
    for (let x = 0; x <= columns; x++) {
      const on = x < columns && edge(at(x, y - 1), at(x, y))
      if (on && start < 0) start = x
      if (!on && start >= 0) {
        parts.push(`M${start * cell},${y * cell}H${x * cell}`)
        start = -1
      }
    }
  }
  return parts.join('')
}
