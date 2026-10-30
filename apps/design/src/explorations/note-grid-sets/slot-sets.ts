import type { Placement } from './pack-blocks'

/** a set slotted into the grid: its top-left cell, its rectangle and how many of its cells (row by row) hold notes. */
export type Slot = Placement & { count: number }

export type Slotting = {
  slots: Slot[]
  /** per cell, row by row: the index of the set that holds it, -1 when empty. */
  owner: number[]
}

/**
 * the widths (in cells) a group of `count` notes can take, the squarest first: by how far the
 * rectangle is from a square, then by how many cells it leaves unused, then the narrower.
 */
export function candidateWidths(count: number, maxColumns: number): number[] {
  const widths = Array.from({ length: Math.min(count, maxColumns) }, (_, i) => i + 1)
  const shape = (w: number) => {
    const h = Math.ceil(count / w)
    return [Math.abs(w - h), w * h - count, w]
  }
  return widths.sort((a, b) => {
    const [ra, rb] = [shape(a), shape(b)]
    return ra[0] - rb[0] || ra[1] - rb[1] || ra[2] - rb[2]
  })
}

/**
 * slots the sets, in the given order (put the biggest first), into a `columns` x `rows` grid of
 * cells. every set takes the squarest shape that fits the free cells, at the first free spot
 * (left to right, top to bottom); its notes fill the rectangle row by row, so a short last row
 * leaves cells that a later, smaller set can take. null when a set does not fit.
 */
export function slotSets(counts: number[], columns: number, rows: number): Slotting | null {
  const owner = Array.from({ length: columns * rows }, () => -1)
  const free = (x: number, y: number, w: number, n: number) => {
    for (let k = 0; k < n; k++) {
      const cx = x + (k % w)
      const cy = y + Math.floor(k / w)
      if (cy >= rows || owner[cy * columns + cx] !== -1) return false
    }
    return true
  }
  const slots: Slot[] = []
  for (const [index, count] of counts.entries()) {
    let slot: Slot | null = null
    for (const w of candidateWidths(count, columns)) {
      const h = Math.ceil(count / w)
      for (let y = 0; y + h <= rows && !slot; y++) {
        for (let x = 0; x + w <= columns && !slot; x++) {
          if (free(x, y, w, count)) slot = { x, y, columns: w, rows: h, count }
        }
      }
      if (slot) break
    }
    if (!slot) return null
    for (let k = 0; k < count; k++) {
      owner[(slot.y + Math.floor(k / slot.columns)) * columns + slot.x + (k % slot.columns)] = index
    }
    slots.push(slot)
  }
  return { slots, owner }
}

export type Fit = Slotting & { cell: number; columns: number; rows: number }

/**
 * the largest whole-px cell at which every set slots into the width x height box, and the grid it
 * makes (the container is exactly columns x rows cells). when not even 1px cells fit the grid grows
 * downward rather than dropping notes.
 */
export function fitContainer(counts: number[], width: number, height: number): Fit {
  const total = counts.reduce((sum, count) => sum + count, 0)
  for (let cell = Math.floor(Math.min(width, height)); cell >= 1; cell--) {
    const columns = Math.floor(width / cell)
    const rows = Math.floor(height / cell)
    if (columns * rows < total) continue
    const slotting = slotSets(counts, columns, rows)
    if (slotting) return { ...slotting, cell, columns, rows }
  }
  const columns = Math.max(1, Math.floor(width))
  const slotting = slotSets(counts, columns, total) as Slotting
  return { ...slotting, cell: 1, columns, rows: total }
}
