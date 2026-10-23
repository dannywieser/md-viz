import { Card, cn } from '@md-viz/ui'
import type { LastSync, ScanProgress, SyncProgress } from '../../../shared/ipc'

const formatTime = (iso: string) => new Date(iso).toLocaleString().toLowerCase()

interface FolderCardProps {
  folder: string
  lastSync: LastSync | null
  scanning: boolean
  scanProgress: ScanProgress | null
  count: number | null
  syncing: boolean
  syncProgress: SyncProgress | null
  className?: string
}

/** the chosen folder with when it was last synced and the progress of a running scan or sync. */
export function FolderCard({
  folder,
  lastSync,
  scanning,
  scanProgress,
  count,
  syncing,
  syncProgress,
  className,
}: FolderCardProps) {
  return (
    <Card className={cn('max-w-full gap-2 px-4 py-3', className)}>
      <p className="break-all text-sm" aria-label="chosen folder">
        {folder}
      </p>
      <p className="text-sm text-muted-foreground">
        {lastSync ? `last synced ${formatTime(lastSync.syncedAt)}` : 'never synced'}
      </p>
      {scanning && scanProgress && (
        <p role="status" className="text-sm">
          scanning… {scanProgress.dirs} folders, {scanProgress.mdFiles} notes so far
        </p>
      )}
      {count !== null && (
        <p role="status" className="text-2xl font-bold">
          {count} {count === 1 ? 'note' : 'notes'}
        </p>
      )}
      {syncing && syncProgress && (
        <p role="status" className="text-sm">
          syncing… {syncProgress.synced} pushed, {syncProgress.deleted} deleted of{' '}
          {syncProgress.total}
        </p>
      )}
    </Card>
  )
}
