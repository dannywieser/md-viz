import type { ReactNode } from 'react'
import { colorVar } from './note-colors'

/** height of the bar across the top of a grid, px. */
export const BAR_PX = 32

type HoverBarProps = {
  /** px: the width of the grid the bar sits on. */
  width: number
  /** what to show while nothing is hovered. */
  idle: string
  hovered: { name: string; color: number; note: number } | null
  /** something at the right end of the bar, like a toggle. */
  action?: ReactNode
}

/** the white bar flush across the top of a grid: the totals, or the hovered set (with its colour) and note. */
export function HoverBar({ width, idle, hovered, action }: HoverBarProps) {
  return (
    <div
      className="flex items-center gap-2 border-b bg-card px-2 text-xs"
      style={{ width, height: BAR_PX }}
    >
      {hovered ? (
        <>
          <span
            aria-hidden
            className="size-3 shrink-0 border"
            style={{ background: colorVar(hovered.color) }}
          />
          <span className="font-bold">{hovered.name}</span>
          <span className="truncate text-muted-foreground">note {hovered.note + 1}</span>
        </>
      ) : (
        <span className="truncate text-muted-foreground">{idle}</span>
      )}
      {action && <div className="ml-auto flex shrink-0 items-center">{action}</div>}
    </div>
  )
}
