/**
 * dot spacing for a grid with this cell, always landing on cell corners: a whole multiple of the
 * cell when it is smaller than `min`, an even division of it when larger than `max`, else the cell.
 */
export function latticeSpacing(cell: number, min = 16, max = 32) {
  if (cell > max) return cell / Math.ceil(cell / max)
  return cell * Math.max(1, Math.ceil(min / cell))
}
