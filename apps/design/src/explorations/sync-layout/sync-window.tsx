import { ErrorState, StateBlock } from '@md-viz/ui'
import { AppFrame } from './app-frame'
import {
  doneGroups,
  emptyGroups,
  LAST_SYNCED,
  scanProgress,
  SOURCE,
  syncProgress,
  type Phase,
} from './fake-sync'
import { progressText } from './progress-lines'
import { StatusGrids } from './status-grids'
import { StatusRow } from './status-row'
import { SyncProgress } from './sync-progress'
import { WindowHeader } from './window-header'
import { WINDOW } from './window-size'

/** how the progress covers the grids: a solid block in place of them, or a block on a see-through veil over them. */
export type Placement = 'takeover' | 'overlay'

/** notes in the source once it has been scanned. */
const COUNT = 652

interface SyncWindowProps {
  caption: string
  placement: Placement
  phase: Phase
  /** how far a scan or sync has got, 0-100. */
  percent: number
}

/** the redesigned sync window: fixed size, compact status row, grids of one width filling the height. */
export function SyncWindow({ caption, placement, phase, percent }: SyncWindowProps) {
  const busy = phase === 'scanning' || phase === 'syncing'
  const empty = phase === 'never' || phase === 'empty'
  const text = progressText(phase, syncProgress(percent), scanProgress(percent))

  const count = phase === 'empty' ? 0 : phase === 'scanning' ? null : COUNT
  const lastSynced = phase === 'never' || phase === 'empty' ? null : LAST_SYNCED

  const progress = text && (
    <StateBlock>
      <SyncProgress {...text} />
    </StateBlock>
  )
  const grids = <StatusGrids groups={empty ? emptyGroups() : doneGroups()} />

  const body =
    phase === 'error' ? (
      <div className="min-h-0 flex-1 px-4 pb-4">
        <StateBlock fill>
          <ErrorState
            detail="could not reach the cache at http://localhost:8787"
            onRetry={() => {}}
          />
        </StateBlock>
      </div>
    ) : placement === 'takeover' && progress ? (
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-4">{progress}</div>
    ) : (
      <div className="relative flex min-h-0 flex-1 flex-col">
        {grids}
        {progress && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={text.label}
            className="absolute inset-0 flex items-center justify-center bg-background/70"
          >
            {progress}
          </div>
        )}
      </div>
    )

  return (
    <AppFrame caption={caption} {...WINDOW}>
      <WindowHeader busy={busy} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 pt-6">
        <StatusRow source={SOURCE} lastSynced={lastSynced} count={count} />
        {body}
      </div>
    </AppFrame>
  )
}
