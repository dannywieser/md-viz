/** px to move a tooltip (spanning `left` to `left + width`) sideways so it sits inside the viewport, `margin` from either edge; 0 when it already fits. A tooltip wider than the room is aligned to the left margin. */
export function tooltipShift(left: number, width: number, viewportWidth: number, margin: number) {
  const overflowRight = left + width - (viewportWidth - margin)
  if (overflowRight > 0) return Math.max(-overflowRight, margin - left)
  return Math.max(0, margin - left)
}
