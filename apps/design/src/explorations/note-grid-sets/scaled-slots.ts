import { candidateWidths } from './slot-sets'

/** a set placed on the unit grid: its squares are `scale` units wide, `columns` of them per row. */
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

/** how many shapes per set are tried at each scale, squarest first. */
const SHAPES_TRIED = 6

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
  if (shares[0] * columns * rows < counts[0]) return null
  const owner = Array.from({ length: columns * rows }, () => -1)
  const free = (x: number, y: number, w: number, h: number) => {
    if (x + w > columns || y + h > rows) return false
    for (let cy = y; cy < y + h; cy++)
      for (let cx = x; cx < x + w; cx++) if (owner[cy * columns + cx] !== -1) return false
    return true
  }
  const scales = counts.map((count, i) =>
    Math.max(1, Math.floor(Math.sqrt((shares[i] * columns * rows) / count))),
  )
  const slots: ScaledSlot[] = []
  const order = counts
    .map((_, i) => i)
    .sort((a, b) => counts[b] * scales[b] ** 2 - counts[a] * scales[a] ** 2)
  for (const index of order) {
    const slot = place(counts[index], scales[index], columns, rows, free)
    if (!slot) return null
    slots[index] = slot
    for (let k = 0; k < counts[index]; k++) {
      const sx = slot.x + (k % slot.columns) * slot.scale
      const sy = slot.y + Math.floor(k / slot.columns) * slot.scale
      for (let cy = sy; cy < sy + slot.scale; cy++)
        for (let cx = sx; cx < sx + slot.scale; cx++) owner[cy * columns + cx] = index
    }
  }
  return { unit, columns, rows, slots, owner, shares }
}

/** the first free spot for `count` squares of `scale` units, or a smaller scale when none fits. */
function place(
  count: number,
  scale: number,
  columns: number,
  rows: number,
  free: (x: number, y: number, w: number, h: number) => boolean,
): ScaledSlot | null {
  for (let s = scale; s >= 1; s--) {
    const widths = candidateWidths(count, Math.floor(columns / s)).slice(0, SHAPES_TRIED)
    for (const w of widths) {
      const h = Math.ceil(count / w)
      const last = count - (h - 1) * w
      for (let y = 0; y + h * s <= rows; y++) {
        for (let x = 0; x + w * s <= columns; x++) {
          const fits = free(x, y, w * s, (h - 1) * s) && free(x, y + (h - 1) * s, last * s, s)
          if (fits) return { x, y, columns: w, rows: h, scale: s }
        }
      }
    }
  }
  return null
}
