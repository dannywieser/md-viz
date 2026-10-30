import type { ReactNode } from 'react'

type GridTooltipProps = {
  /** px from the grid's left edge: the tooltip is centred on it. */
  x: number
  /** px from the grid's top edge: the tooltip sits above it. */
  y: number
  children: ReactNode
}

/** the one shared tooltip of a grid, above the hovered item. */
export function GridTooltip({ x, y, children }: GridTooltipProps) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap border bg-card px-2 py-1 text-xs text-card-foreground shadow-hard"
      style={{ left: x, top: y - 8 }}
    >
      {children}
    </div>
  )
}
