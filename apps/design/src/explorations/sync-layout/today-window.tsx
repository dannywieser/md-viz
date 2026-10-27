import { Card, ErrorState, NoteGrid, StateBlock } from '@md-viz/ui'
import { AppFrame } from './app-frame'
import { TODAY_WINDOW } from './window-size'
import { WindowHeader } from './window-header'
import {
  doneGroups,
  emptyGroups,
  LAST_SYNCED,
  scanProgress,
  SOURCE,
  syncProgress,
  type Phase,
} from './fake-sync'

const COLUMN = 272
const GAP = 32

/** the sync window as it is now, for comparison: a tall card with text progress and 160px grids. */
export function TodayWindow({ phase, percent }: { phase: Phase; percent: number }) {
  const scan = scanProgress(percent)
  const sync = syncProgress(percent)
  const groups = phase === 'never' || phase === 'empty' ? emptyGroups() : doneGroups()
  const synced = phase !== 'never' && phase !== 'empty'
  return (
    <AppFrame caption="today" {...TODAY_WINDOW}>
      <WindowHeader busy={phase === 'scanning' || phase === 'syncing'} />
      <div
        className="flex flex-col items-start gap-8 p-4 pt-8"
        style={{ width: COLUMN * 3 + GAP * 2 + 32 }}
      >
        <Card className="w-full max-w-full gap-2 px-4 py-3">
          <p className="break-all text-sm">{SOURCE}</p>
          <p className="text-sm text-muted-foreground">
            {synced ? `last synced ${LAST_SYNCED}` : 'never synced'}
          </p>
          {phase === 'scanning' && (
            <p role="status" className="text-sm">
              scanning… {scan.dirs} folders, {scan.mdFiles} notes so far
            </p>
          )}
          {phase !== 'scanning' && (
            <p role="status" className="text-2xl font-bold">
              {phase === 'empty' ? 0 : 652} notes
            </p>
          )}
          {phase === 'syncing' && (
            <p role="status" className="text-sm">
              syncing… {sync.done} pushed, 0 deleted of {sync.total}
            </p>
          )}
        </Card>
        {phase === 'error' ? (
          <StateBlock>
            <ErrorState detail="could not reach the cache at http://localhost:8787" />
          </StateBlock>
        ) : (
          <div className="flex" style={{ columnGap: GAP }}>
            {(['updated', 'deleted', 'unchanged'] as const).map((group) => (
              <section
                key={group}
                aria-label={group}
                className="shrink-0"
                style={{ width: COLUMN }}
              >
                <NoteGrid
                  notes={groups[group]}
                  label={group}
                  height={160}
                  align="start"
                  compactEmpty
                />
              </section>
            ))}
          </div>
        )}
      </div>
    </AppFrame>
  )
}
