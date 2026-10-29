/** the heights (whole px) of `count` stripes that fill a cell of `cell` px; the first stripes take the leftover px. */
export function stripeHeights(cell: number, count: number): number[] {
  const base = Math.floor(cell / count)
  const extra = cell - base * count
  return Array.from({ length: count }, (_, i) => base + (i < extra ? 1 : 0))
}
