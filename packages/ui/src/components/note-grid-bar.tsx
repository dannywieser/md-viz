import type { ReactNode } from 'react'
import { colorVar } from '../lib/note-colors'

/** height of the bar across the top of a grid, px. */
export const BAR_PX = 32

type NoteGridBarProps = {
  /** px: the width of the grid the bar sits on. */
  width: number
  /** what to show while nothing is hovered. */
  idle: string
  /** the hovered note: its title and the name and colour of its set. */
  hovered: { title: string; setName: string; color: number } | null
  /** something at the right end of the bar, like the toggle. */
  action?: ReactNode
}

/** the bar flush across the top of a grid: the totals, or the hovered note with its set (and the set's colour). */
export function NoteGridBar({ width, idle, hovered, action }: NoteGridBarProps) {
  return (
    <div
      data-slot="note-grid-bar"
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
          <span className="shrink-0 font-bold">{hovered.setName}</span>
          <span className="truncate text-muted-foreground">{hovered.title}</span>
        </>
      ) : (
        <span className="truncate text-muted-foreground">{idle}</span>
      )}
      {action && <div className="ml-auto flex shrink-0 items-center">{action}</div>}
    </div>
  )
}
