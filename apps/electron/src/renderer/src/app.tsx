import { useEffect, useState } from 'react'
import { AppHeader, Button, ErrorState, StateBlock } from '@md-viz/ui'
import type { LastSync } from '../../shared/ipc'
import { FolderCard } from './components/folder-card'
import { SyncGrids } from './components/sync-grids'
import { useScan } from './hooks/use-scan'
import { useSync } from './hooks/use-sync'

// room in the header for the window controls drawn over it: the macOS traffic lights on the left,
// the windows and linux buttons on the right.
const headerClearance = navigator.userAgent.includes('Macintosh') ? 'pl-24' : 'pr-40'

export function App() {
  const [error, setError] = useState<string | null>(null)
  // the width of the status grids, which the header matches while they are shown.
  const [gridsWidth, setGridsWidth] = useState<number | null>(null)
  const scan = useScan(setError)
  const sync = useSync(scan.folder, setError)

  const selectFolder = async (picked: string, saved: LastSync | null = null) => {
    sync.reset(saved)
    await scan.scan(picked)
  }

  const chooseFolder = async () => {
    const picked = await window.api.pickFolder()
    if (picked) await selectFolder(picked)
  }

  // reopen the folder from the previous run, with its last sync.
  useEffect(() => {
    void window.api.loadLast().then((last) => {
      if (last) void selectFolder(last.folder, last.lastSync)
    })
    // runs once, on launch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const folderCard = scan.folder && (
    <FolderCard
      folder={scan.folder}
      lastSync={sync.lastSync}
      scanning={scan.scanning}
      scanProgress={scan.progress}
      count={scan.count}
      syncing={sync.syncing}
      syncProgress={sync.progress}
      className={sync.lastSync ? 'w-full' : undefined}
    />
  )

  const busy = scan.scanning || sync.syncing

  return (
    <div className="flex h-screen flex-col">
      <AppHeader
        title="md-viz sync"
        subtitle="sync"
        className={headerClearance}
        style={gridsWidth === null ? undefined : { width: gridsWidth }}
      >
        <Button onClick={() => void chooseFolder()} disabled={busy}>
          choose folder
        </Button>
        <Button onClick={() => void sync.sync()} disabled={busy || !scan.folder}>
          sync
        </Button>
      </AppHeader>
      <main className="flex flex-1 flex-col items-start gap-8 overflow-auto p-4 pt-8">
        {scan.folder &&
          // with a sync, the card sits above the grids and, like the header, is as wide as they are.
          (sync.lastSync ? (
            <SyncGrids notes={sync.lastSync.notes} onWidthChange={setGridsWidth}>
              {folderCard}
            </SyncGrids>
          ) : (
            folderCard
          ))}
        {error && (
          <StateBlock>
            <ErrorState detail={error} />
          </StateBlock>
        )}
      </main>
    </div>
  )
}
