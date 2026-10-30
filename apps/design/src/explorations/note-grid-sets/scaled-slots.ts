/**
 * a set placed on the unit grid as a square block of `columns` x `rows` squares (the same number),
 * each `scale` units wide; the squares past the set's notes are filler.
 */
export type ScaledSlot = { x: number; y: number; columns: number; rows: number; scale: number }

export type ScaledFit = {
  /** the smallest square, px: every square is a whole multiple of it. */
  unit: number
  /** the container in units. */
  columns: number
  rows: number
  slots: ScaledSlot[]
  /** per unit cell, row by row: the index of the set whose square covers it, -1 when empty. */
  owner: number[]
  /** the share of the space each set was given (0..1, sums to 1), before rounding to squares. */
  shares: number[]
}

/** squares per side of the square block that holds `count` notes (the rest of the block is filler). */
export function blockSide(count: number): number {
  return Math.ceil(Math.sqrt(count))
}

/**
 * the share of the space of each set: its notes to the power of `exponent` over the sum. 1 is by
 * notes (every square ends up the same size), 0 is the same for every set (a set of one note gets
 * as much as the biggest), in between softens the difference.
 */
export function spaceShares(counts: number[], exponent: number): number[] {
  const weights = counts.map((count) => count ** exponent)
  const sum = weights.reduce((total, weight) => total + weight, 0)
  return weights.map((weight) => weight / sum)
}

/**
 * gives every set its share of a `width` x `height` box and lets its squares grow to fill it, in
 * whole multiples of one smallest square (`unit`, px): a set whose share is bigger than its
 * notes at unit size gets squares 2, 3... units wide. the sets (biggest first) are placed first fit,
 * left to right and top to bottom, as rectangles of squares; a set that does not fit at its scale
 * tries a smaller one. the unit is the largest whole px size at which the biggest set (the first)
 * has room for its notes at one unit and every set fits.
 */
export function scaleLayout(
  counts: number[],
  exponent: number,
  width: number,
  height: number,
): ScaledFit {
  const shares = spaceShares(counts, exponent)
  for (let unit = Math.min(width, height); unit >= 1; unit--) {
    const fit = tryUnit(counts, shares, unit, Math.floor(width / unit), Math.floor(height / unit))
    if (fit) return fit
  }
  return { unit: 1, columns: width, rows: height, slots: [], owner: [], shares }
}

function tryUnit(
  counts: number[],
  shares: number[],
  unit: number,
  columns: number,
  rows: number,
): ScaledFit | null {
  // the smallest square is the one the biggest set needs: its share must hold all its notes at one unit
  if (shares[0] * columns * rows < blockSide(counts[0]) ** 2) return null
  const owner = Array.from({ length: columns * rows }, () => -1)
  const used = Array.from({ length: columns * rows }, () => false)
  const free = (x: number, y: number, side: number) => {
    if (x + side > columns || y + side > rows) return false
    for (let cy = y; cy < y + side; cy++)
      for (let cx = x; cx < x + side; cx++) if (used[cy * columns + cx]) return false
    return true
  }
  const scales = counts.map((count, i) =>
    Math.max(1, Math.floor(Math.sqrt(shares[i] * columns * rows) / blockSide(count))),
  )
  const slots: ScaledSlot[] = []
  const order = counts
    .map((_, i) => i)
    .sort(
      (a, b) => (blockSide(counts[b]) * scales[b]) ** 2 - (blockSide(counts[a]) * scales[a]) ** 2,
    )
  for (const index of order) {
    const slot = place(blockSide(counts[index]), scales[index], columns, rows, free)
    if (!slot) return null
    slots[index] = slot
    for (let cy = slot.y; cy < slot.y + slot.rows * slot.scale; cy++)
      for (let cx = slot.x; cx < slot.x + slot.columns * slot.scale; cx++)
        used[cy * columns + cx] = true
    for (let k = 0; k < counts[index]; k++) {
      const sx = slot.x + (k % slot.columns) * slot.scale
      const sy = slot.y + Math.floor(k / slot.columns) * slot.scale
      for (let cy = sy; cy < sy + slot.scale; cy++)
        for (let cx = sx; cx < sx + slot.scale; cx++) owner[cy * columns + cx] = index
    }
  }
  return { unit, columns, rows, slots, owner, shares }
}

/** the first free spot for a block of `side` x `side` squares of `scale` units, or a smaller scale when none fits. */
function place(
  side: number,
  scale: number,
  columns: number,
  rows: number,
  free: (x: number, y: number, side: number) => boolean,
): ScaledSlot | null {
  for (let s = scale; s >= 1; s--) {
    for (let y = 0; y + side * s <= rows; y++) {
      for (let x = 0; x + side * s <= columns; x++) {
        if (free(x, y, side * s)) return { x, y, columns: side, rows: side, scale: s }
      }
    }
  }
  return null
}
