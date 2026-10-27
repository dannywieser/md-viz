import { Loader, ProgressBar, StateBlock } from '@md-viz/ui'
import type { ScanProgress, SyncProgress } from '../../../shared/ipc'

interface SyncOverlayProps {
  scanning: boolean
  scanProgress: ScanProgress | null
  syncing: boolean
  syncProgress: SyncProgress | null
}

/** the loader, what is going on and its counts in a block on a see-through veil over what is under it; nothing while idle. */
export function SyncOverlay({ scanning, scanProgress, syncing, syncProgress }: SyncOverlayProps) {
  if (!scanning && !syncing) return null

  const label = syncing ? 'syncing' : 'scanning'
  const line = syncing ? 'syncing notes to the cache…' : 'scanning the folder…'
  const scanned = scanProgress ?? { dirs: 0, mdFiles: 0 }
  const count = syncing
    ? syncProgress &&
      `${syncProgress.synced} pushed, ${syncProgress.deleted} deleted of ${syncProgress.total}`
    : `${scanned.dirs} folders, ${scanned.mdFiles} notes so far`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="absolute inset-0 z-10 flex items-center justify-center bg-background/70"
    >
      <StateBlock>
        <div className="flex w-96 max-w-full flex-col items-center gap-4 p-6 text-center">
          <Loader label={label} cell={12} />
          <p className="max-w-full truncate text-sm">{line}</p>
          {syncing && syncProgress && (
            <ProgressBar
              value={syncProgress.synced + syncProgress.deleted}
              max={syncProgress.total}
              label="sync progress"
            />
          )}
          {count && <p className="text-sm text-muted-foreground">{count}</p>}
        </div>
      </StateBlock>
    </div>
  )
}
