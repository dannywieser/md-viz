import type { ReactNode } from 'react'
import { Card } from '@md-viz/ui'

interface StatusRowProps {
  source: string
  /** when it was last synced, or null when it never was. */
  lastSynced: string | null
  /** the number of notes in the source, or null while it is being counted. */
  count: number | null
  /** progress that fits a line, shown before the count. */
  children?: ReactNode
}

/** the compact status card: source and last synced on one line, the note count at the end. */
export function StatusRow({ source, lastSynced, count, children }: StatusRowProps) {
  return (
    <Card className="mx-4 flex-row items-center justify-between gap-4 px-4 py-2">
      <p className="min-w-0 truncate text-sm" aria-label="status">
        <span aria-label="chosen source">{source}</span>
        <span className="text-muted-foreground">
          {' '}
          · {lastSynced ? `last synced ${lastSynced}` : 'never synced'}
        </span>
      </p>
      {children}
      {count !== null && (
        <p role="status" className="shrink-0 text-lg font-bold">
          {count} {count === 1 ? 'note' : 'notes'}
        </p>
      )}
    </Card>
  )
}
