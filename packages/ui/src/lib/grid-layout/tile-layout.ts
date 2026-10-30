import { divisorsOf, EXACT_WIDTH_SHARE } from './grid-geometry'

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

/** how much a combination of sizes counts against its distance from the ideal ones for making the squares smaller (the share of the unit lost to the biggest possible). */
const SMALLER_WEIGHT = 3

/** how many of the best combinations are tried to place before falling back to equal squares. */
const TRIES = 20

/**
 * above this many sets the sizes are not searched for (the search grows with every set) and all
 * squares are the same size, the sets still flowing one after the other.
 */
export const MAX_TILED_SETS = 8

/**
 * how many times bigger than the smallest square each set's squares would be if every set got the
 * same share of the space: the set with the least space per note is 1.
 */
export function idealScales(counts: number[]): number[] {
  const ratios = counts.map((count) => 1 / counts.length / count)
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
      // under the full columns of squares is what a whole number of squares left of the rect's height
      const fullColumns = Math.floor(take / perColumn)
      const under = rect.h - perColumn * size
      if (fullColumns > 0 && under > 0) {
        next.push({ x: rect.x, y: rect.y + perColumn * size, w: fullColumns * size, h: under })
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

/** every combination of power-of-two sizes near the ideal ones: sizes, area in units, biggest size and distance from ideal. */
function scaleCombos(counts: number[], ideal: number[]) {
  const options = ideal.map(candidates)
  const combos: { scales: number[]; area: number; top: number; cost: number }[] = []
  const scales: number[] = []
  const visit = (i: number) => {
    if (i === counts.length) {
      combos.push({
        scales: [...scales],
        area: counts.reduce((sum, count, k) => sum + count * scales[k] ** 2, 0),
        top: Math.max(...scales),
        cost: scales.reduce((sum, s, k) => sum + Math.abs(Math.log2(s / ideal[k])), 0),
      })
      return
    }
    for (const option of options[i]) {
      scales[i] = option
      visit(i + 1)
    }
  }
  visit(0)
  return combos
}

/** the largest unit (px, at least `min`) for which `area` cells fit a grid whose sides are at least `top` units; 0 when none does. */
function largestUnit(area: number, top: number, width: number, height: number, min: number) {
  const fits = (unit: number) => {
    const columns = Math.floor(width / unit)
    const rows = Math.floor(height / unit)
    return columns * rows >= area && top <= Math.min(columns, rows)
  }
  if (!fits(min)) return 0
  let low = min
  let high = Math.max(min, Math.min(width, height))
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (fits(mid)) low = mid
    else high = mid - 1
  }
  return low
}

/** how a unit is made to fit the width: as it is, or the biggest divisor of the width not over it (and at least `min`; 0 when there is none). */
type Snap = (unit: number, min: number) => number

const keep: Snap = (unit) => unit

const divisorSnap = (width: number): Snap => {
  const divisors = divisorsOf(width)
  return (unit, min) => {
    const found = divisors.find((divisor) => divisor <= unit)
    return found !== undefined && found >= min ? found : 0
  }
}

/** the sets as one-unit squares on the biggest unit for which they fit the box; the rows are only as many as the notes need. null when `snap` leaves no unit. */
function uniformFit(counts: number[], width: number, height: number, snap: Snap): TileFit | null {
  const ones = counts.map(() => 1)
  const total = counts.reduce((sum, count) => sum + count, 0)
  const fitted = largestUnit(total, 1, width, height, 1)
  if (fitted === 0) return { ...placeTiles(counts, ones, width, Math.ceil(total / width)), unit: 1 }
  const unit = snap(fitted, 1)
  if (unit === 0) return null
  const columns = Math.floor(width / unit)
  return { ...placeTiles(counts, ones, columns, Math.ceil(total / columns)), unit }
}

/** the best combination of sizes for the box with the units `snap` allows; null when no combination gets a unit of 3px. */
function searchFit(counts: number[], width: number, height: number, snap: Snap): TileFit | null {
  const total = counts.reduce((sum, count) => sum + count, 0)
  const biggest = snap(largestUnit(total, 1, width, height, 1), MIN_UNIT)
  if (biggest < MIN_UNIT) return null

  const ideal = idealScales(counts).map((scale) => Math.min(scale, MAX_SCALE))
  const ranked = scaleCombos(counts, ideal)
    .map((combo) => {
      const fitted = largestUnit(combo.area, combo.top, width, height, MIN_UNIT)
      const unit = fitted === 0 ? 0 : snap(fitted, MIN_UNIT)
      return { ...combo, unit, score: combo.cost + SMALLER_WEIGHT * (1 - unit / biggest) }
    })
    .filter((combo) => combo.unit > 0)
    .sort((a, b) => a.score - b.score || b.unit - a.unit)

  for (const combo of ranked.slice(0, TRIES)) {
    const columns = Math.floor(width / combo.unit)
    const most = Math.floor(height / combo.unit)
    for (let rows = Math.max(Math.ceil(combo.area / columns), combo.top); rows <= most; rows++) {
      const fit = placeTiles(counts, combo.scales, columns, rows)
      if (fit.tiles.length === total) return { ...fit, unit: combo.unit }
    }
  }
  return null
}

/**
 * the grid of the sets as flowing shapes in the `width` x `height` box. every combination of
 * square sizes near the ideal ones (see `idealScales`) is tried: the squares are as big as the
 * box allows for those sizes (the largest unit, in whole px, for which the notes' cells fit), and a
 * combination wins by being close to the ideal sizes without making the squares much smaller than
 * all one-unit squares would. the grid has only as many rows as its cells need, so what the sets
 * do not fill is a few empty cells at the end, not a band of the box. the units that divide the
 * width are tried as well, for a grid exactly as wide as the box, and one is used when it is at
 * most a fifth smaller (`EXACT_WIDTH_SHARE`) than the biggest unit. above `MAX_TILED_SETS` sets
 * the sizes are not searched and all squares are the same, and so they are when the box is too
 * small for squares of 3px.
 */
export function fillTileLayout(counts: number[], width: number, height: number): TileFit {
  const fit = (snap: Snap) =>
    (counts.length <= MAX_TILED_SETS ? searchFit(counts, width, height, snap) : null) ??
    uniformFit(counts, width, height, snap)
  const plain = fit(keep) as TileFit
  const exact = fit(divisorSnap(width))
  return exact && exact.unit >= plain.unit * EXACT_WIDTH_SHARE ? exact : plain
}
