import { Card, ErrorState, StateBlock } from '@md-viz/ui'
import { AppFrame } from './app-frame'
import { WINDOW } from './window-size'
import {
  doneGroups,
  emptyGroups,
  LAST_SYNCED,
  scanProgress,
  SOURCE,
  syncProgress,
  type Detail,
  type Phase,
} from './fake-sync'
import { progressText } from './progress-lines'
import { StatusGrids } from './status-grids'
import { StatusRow } from './status-row'
import { SyncProgress } from './sync-progress'
import { WindowHeader } from './window-header'

/** where the progress is shown: in the status row, in a strip under it, or in place of the grids. */
export type Placement = 'row' | 'strip' | 'takeover'

/** notes in the source once it has been scanned. */
const COUNT = 652

interface SyncWindowProps {
  caption: string
  placement: Placement
  phase: Phase
  /** how far a scan or sync has got, 0-100. */
  percent: number
  detail: Detail
}

/** the redesigned sync window: fixed size, compact status row, grids filling the height. */
export function SyncWindow({ caption, placement, phase, percent, detail }: SyncWindowProps) {
  const busy = phase === 'scanning' || phase === 'syncing'
  const empty = phase === 'never' || phase === 'empty'
  const text = progressText(phase, detail, syncProgress(percent), scanProgress(percent))

  const count = phase === 'empty' ? 0 : phase === 'scanning' ? null : COUNT
  const lastSynced = phase === 'never' || phase === 'empty' ? null : LAST_SYNCED

  const progress = (shape: 'inline' | 'strip' | 'center') =>
    text && <SyncProgress shape={shape} {...text} />

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
    ) : placement === 'takeover' && text ? (
      <div className="min-h-0 flex-1 px-4 pb-4">
        <StateBlock fill>{progress('center')}</StateBlock>
      </div>
    ) : (
      <StatusGrids groups={empty ? emptyGroups() : doneGroups()} />
    )

  return (
    <AppFrame caption={caption} {...WINDOW}>
      <WindowHeader busy={busy} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 pt-6">
        <StatusRow source={SOURCE} lastSynced={lastSynced} count={count}>
          {placement === 'row' && progress('inline')}
        </StatusRow>
        {placement === 'strip' && text && (
          <Card className="mx-4 px-4 py-2">{progress('strip')}</Card>
        )}
        {body}
      </div>
    </AppFrame>
  )
}
