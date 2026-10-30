import { ownerOutline } from './flow-layout'
import { spaceShares } from './scaled-slots'

/** one note's square on the unit grid: `size` units wide. */
export type Tile = { set: number; note: number; x: number; y: number; size: number }

export type TileFit = {
  /** px: the smallest square; every square is a power of two times it. */
  unit: number
  columns: number
  rows: number
  tiles: Tile[]
  /** per unit cell, row by row: the set that holds it, -1 when empty. */
  owner: number[]
  /** per unit cell, row by row: the index in `tiles` of the square over it, -1 when empty. */
  tileAt: number[]
  /** the square size of each set, in units. */
  scales: number[]
}

type Rect = { x: number; y: number; w: number; h: number }

const MIN_UNIT = 3
const MAX_SCALE = 16

/** how much of the box a grid covers counts against how far the sizes are from the ideal ones. */
const COVERAGE_WEIGHT = 2

/**
 * how many times bigger than the smallest square each set's squares would be if the space were
 * shared as `spaceShares` says: the set with the least space per note is 1.
 */
export function idealScales(counts: number[], exponent: number): number[] {
  const shares = spaceShares(counts, exponent)
  const ratios = shares.map((share, i) => share / counts[i])
  const least = Math.min(...ratios)
  return ratios.map((ratio) => Math.sqrt(ratio / least))
}

/**
 * places the sets (the ones with the biggest squares first) on a `columns` x `rows` unit grid
 * without filler. the free space is a queue of rectangles; a set fills the first one with its
 * squares, column by column, and what is left of it (the rest of the last column, then the
 * columns to the right) goes to the front of the queue, so the next set, whose squares are a
 * power of two smaller, carries on from where this one stopped. every set is one connected shape.
 */
export function placeTiles(
  counts: number[],
  scales: number[],
  columns: number,
  rows: number,
): TileFit {
  const order = counts
    .map((_, i) => i)
    .sort((a, b) => scales[b] - scales[a] || counts[a] - counts[b])
  const tiles: Tile[] = []
  let free: Rect[] = [{ x: 0, y: 0, w: columns, h: rows }]
  for (const set of order) {
    const size = scales[set]
    let left = counts[set]
    let note = 0
    const skipped: Rect[] = []
    while (left > 0 && free.length > 0) {
      const [rect, ...rest] = free
      free = rest
      const perColumn = Math.floor(rect.h / size)
      const perRow = Math.floor(rect.w / size)
      if (perColumn === 0 || perRow === 0) {
        skipped.push(rect)
        continue
      }
      const take = Math.min(left, perColumn * perRow)
      for (let k = 0; k < take; k++, note++) {
        tiles.push({
          set,
          note,
          x: rect.x + Math.floor(k / perColumn) * size,
          y: rect.y + (k % perColumn) * size,
          size,
        })
      }
      left -= take
      const partial = take % perColumn
      const used = Math.floor(take / perColumn) + (partial > 0 ? 1 : 0)
      const next: Rect[] = []
      if (partial > 0) {
        next.push({
          x: rect.x + (used - 1) * size,
          y: rect.y + partial * size,
          w: size,
          h: rect.h - partial * size,
        })
      }
      if (rect.w - used * size > 0) {
        next.push({ x: rect.x + used * size, y: rect.y, w: rect.w - used * size, h: rect.h })
      }
      free = [...next, ...free]
    }
    free = [...skipped, ...free]
  }
  const owner = Array.from({ length: columns * rows }, () => -1)
  const tileAt = Array.from({ length: columns * rows }, () => -1)
  tiles.forEach((tile, index) => {
    for (let y = tile.y; y < tile.y + tile.size; y++)
      for (let x = tile.x; x < tile.x + tile.size; x++) {
        owner[y * columns + x] = tile.set
        tileAt[y * columns + x] = index
      }
  })
  return { unit: 1, columns, rows, tiles, owner, tileAt, scales }
}

/** the powers of two near an ideal scale, within 1..MAX_SCALE. */
function candidates(ideal: number): number[] {
  const low = 2 ** Math.floor(Math.log2(ideal))
  const all = [low / 2, low, low * 2, low * 4].filter((s) => s >= 1 && s <= MAX_SCALE)
  return [...new Set(all)]
}

/**
 * picks power-of-two square sizes for the sets, as close to the ideal ones as possible, for which
 * the area (notes times size squared, in units) is a whole grid whose sides are multiples of the
 * biggest size: then `placeTiles` fills it with no filler. among those the best trade between being
 * close to the ideal sizes and covering the `width` x `height` box wins (a long thin grid has the
 * right sizes but wastes the box). when no such grid gives a unit
 * of 3px or more, the rounded ideal sizes are used on a grid with a few empty cells at the end.
 */
export function tileLayout(
  counts: number[],
  exponent: number,
  width: number,
  height: number,
): TileFit {
  const ideal = idealScales(counts, exponent)
  const options = ideal.map(candidates)
  const found: {
    best: { scales: number[]; columns: number; rows: number; unit: number; score: number } | null
  } = { best: null }
  const scales: number[] = []
  const visit = (i: number) => {
    if (i === counts.length) {
      const top = Math.max(...scales)
      const area = counts.reduce((sum, count, k) => sum + count * scales[k] ** 2, 0)
      const cost = scales.reduce((sum, s, k) => sum + Math.abs(Math.log2(s / ideal[k])), 0)
      for (let d = 1; d * d <= area; d++) {
        if (area % d !== 0) continue
        for (const [columns, rows] of [
          [d, area / d],
          [area / d, d],
        ]) {
          if (columns % top !== 0 || rows % top !== 0) continue
          const unit = Math.min(Math.floor(width / columns), Math.floor(height / rows))
          if (unit < MIN_UNIT) continue
          const coverage = (area * unit * unit) / (width * height)
          const score = cost - COVERAGE_WEIGHT * coverage
          if (!found.best || score < found.best.score)
            found.best = { scales: [...scales], columns, rows, unit, score }
        }
      }
      return
    }
    for (const option of options[i]) {
      scales[i] = option
      visit(i + 1)
    }
  }
  visit(0)
  if (found.best) {
    const { scales: chosen, columns, rows, unit } = found.best
    return { ...placeTiles(counts, chosen, columns, rows), unit }
  }
  const rounded = ideal.map((s) => Math.min(MAX_SCALE, 2 ** Math.round(Math.log2(s))))
  const top = Math.max(...rounded)
  const area = counts.reduce((sum, count, k) => sum + count * rounded[k] ** 2, 0)
  const columns = top * Math.max(1, Math.ceil(Math.sqrt((area * width) / height) / top))
  const rows = top * Math.ceil(area / columns / top)
  const fit = placeTiles(counts, rounded, columns, rows)
  const unit = Math.max(1, Math.min(Math.floor(width / columns), Math.floor(height / rows)))
  return { ...fit, unit }
}

export { ownerOutline }
