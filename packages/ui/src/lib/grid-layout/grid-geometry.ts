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
