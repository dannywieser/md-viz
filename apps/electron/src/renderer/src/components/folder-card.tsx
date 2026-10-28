import { Card } from '@md-viz/ui'
import type { LastSync, SyncTarget } from '../../../shared/ipc'

const formatTime = (iso: string) => new Date(iso).toLocaleString().toLowerCase()

interface FolderCardProps {
  target: SyncTarget
  lastSync: LastSync | null
  /** the notes in the source, or null while they are being counted. */
  count: number | null
}

/** the chosen source (its folder, or bear) and when it was last synced on one line, with the note count at the end. */
export function FolderCard({ target, lastSync, count }: FolderCardProps) {
  return (
    <Card className="flex-row items-center justify-between gap-4 px-4 py-2">
      <p className="min-w-0 truncate text-sm">
        <span aria-label="chosen source">{'folder' in target ? target.folder : target.source}</span>
        <span className="text-muted-foreground">
          {' · '}
          {lastSync ? `last synced ${formatTime(lastSync.syncedAt)}` : 'never synced'}
        </span>
      </p>
      {count !== null && (
        <p role="status" className="shrink-0 text-lg font-bold">
          {count} {count === 1 ? 'note' : 'notes'}
        </p>
      )}
    </Card>
  )
}
