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

/** in a layout with no exact fit: how much the cells left empty count against the distance from the ideal sizes. */
const NEAR_WEIGHT = 20

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

/** one-unit squares on the smallest unit for which `counts` fit the box: the sets flow one after the other. */
function uniformFit(counts: number[], width: number, height: number): TileFit {
  const ones = counts.map(() => 1)
  const total = counts.reduce((sum, count) => sum + count, 0)
  for (let unit = Math.min(width, height); unit >= 1; unit--) {
    const columns = Math.floor(width / unit)
    const rows = Math.floor(height / unit)
    if (columns * rows >= total) return { ...placeTiles(counts, ones, columns, rows), unit }
  }
  return { ...placeTiles(counts, ones, width, Math.ceil(total / width)), unit: 1 }
}

/**
 * the grid of the sets as flowing shapes filling the `width` x `height` box: for each unit (px)
 * the grid is as many units as fit the box each way (the slack is less than one unit), and the
 * sizes of the sets are picked, as close to the ideal ones (see `idealScales`) as possible, so that
 * notes times size squared is exactly that grid. a box of any size is filled by a grid with no
 * filler; the sets take up the difference between the notes and the cells by growing their
 * squares. when no sizes fit any unit exactly, the sizes that leave the fewest cells empty are
 * used, the empty cells being left at the end; a box too small for that, or more than
 * `MAX_TILED_SETS` sets, gets one-unit squares.
 */
export function fillTileLayout(counts: number[], width: number, height: number): TileFit {
  if (counts.length > MAX_TILED_SETS) return uniformFit(counts, width, height)
  const ideal = idealScales(counts)
  const byArea = new Map<number, ReturnType<typeof scaleCombos>>()
  for (const combo of scaleCombos(counts, ideal))
    byArea.set(combo.area, [...(byArea.get(combo.area) ?? []), combo])
  const combos = [...byArea.values()].flat()
  type Pick = { scales: number[]; columns: number; rows: number; unit: number; cost: number }
  let exact: Pick | null = null
  let near: Pick | null = null
  let nearScore = Infinity
  for (let unit = Math.min(width, height); unit >= MIN_UNIT; unit--) {
    const columns = Math.floor(width / unit)
    const rows = Math.floor(height / unit)
    for (const combo of byArea.get(columns * rows) ?? []) {
      if (columns % combo.top !== 0 || rows % combo.top !== 0) continue
      if (!exact || combo.cost < exact.cost - 1e-9)
        exact = { scales: combo.scales, columns, rows, unit, cost: combo.cost }
    }
    for (const combo of combos) {
      const cells = columns * rows
      if (combo.area > cells || columns % combo.top !== 0 || rows % combo.top !== 0) continue
      const score = combo.cost + NEAR_WEIGHT * ((cells - combo.area) / cells)
      if (score < nearScore - 1e-9) {
        nearScore = score
        near = { scales: combo.scales, columns, rows, unit, cost: combo.cost }
      }
    }
  }
  const best = exact ?? near
  if (best) return { ...placeTiles(counts, best.scales, best.columns, best.rows), unit: best.unit }
  return uniformFit(counts, width, height)
}
