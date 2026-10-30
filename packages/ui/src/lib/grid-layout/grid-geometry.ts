/**
 * how much of the biggest square size a size that makes the grid exactly as wide as its box may
 * give up (0.8: at most a fifth smaller); a grid as wide as its box lines up with the cards around it.
 */
export const EXACT_WIDTH_SHARE = 0.8

/** the whole numbers that divide `n`, biggest first. */
export function divisorsOf(n: number): number[] {
  const divisors: number[] = []
  for (let d = n; d >= 1; d--) if (n % d === 0) divisors.push(d)
  return divisors
}

/** the biggest square (whole px) for which `total` cells fit the box, or the biggest that also divides the width when that is not much smaller. */
function biggestCell(total: number, width: number, height: number, cells: number[]) {
  return cells.find((cell) => Math.floor(width / cell) * Math.floor(height / cell) >= total)
}

/**
 * a grid of squares as big as possible (whole px) that holds `total` notes in the box: as many
 * columns as fit, and only as many rows as the notes need (the cells past the last note are
 * empty). when a square size that divides the width, so the grid is exactly as wide as the box,
 * is at most a fifth smaller (`EXACT_WIDTH_SHARE`), that one is used.
 */
export function fillGrid(
  total: number,
  width: number,
  height: number,
): { cell: number; columns: number; rows: number } {
  const all = Array.from({ length: Math.min(width, height) }, (_, i) => Math.min(width, height) - i)
  const plain = biggestCell(total, width, height, all) ?? 1
  const exact = biggestCell(
    total,
    width,
    height,
    divisorsOf(width).filter((d) => d <= Math.min(width, height)),
  )
  const cell = exact !== undefined && exact >= plain * EXACT_WIDTH_SHARE ? exact : plain
  if (Math.floor(width / cell) * Math.floor(height / cell) < total) {
    return { cell: 1, columns: width, rows: Math.ceil(total / width) }
  }
  const columns = Math.floor(width / cell)
  return { cell, columns, rows: Math.ceil(total / columns) }
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
