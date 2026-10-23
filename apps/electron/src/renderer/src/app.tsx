import { useEffect, useState } from 'react'
import { AppHeader, Button, Message } from '@md-viz/ui'
import type { LastSync } from '../../shared/ipc'
import { FolderCard } from './folder-card'
import { SyncGrids } from './sync-grids'
import { useScan } from './use-scan'
import { useSync } from './use-sync'

// room in the header for the window controls drawn over it: the macOS traffic lights on the left,
// the windows and linux buttons on the right.
const headerClearance = navigator.userAgent.includes('Macintosh') ? 'pl-24' : 'pr-40'

export function App() {
  const [error, setError] = useState<string | null>(null)
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

  const busy = scan.scanning || sync.syncing

  return (
    <div className="flex h-screen flex-col">
      <AppHeader title="md-viz sync" subtitle="sync" className={headerClearance}>
        <Button onClick={() => void chooseFolder()} disabled={busy}>
          choose folder
        </Button>
        <Button onClick={() => void sync.sync()} disabled={busy || !scan.folder}>
          sync
        </Button>
      </AppHeader>
      <main className="flex flex-1 flex-col items-start gap-8 overflow-auto p-4 pt-8">
        {scan.folder && (
          <FolderCard
            folder={scan.folder}
            lastSync={sync.lastSync}
            scanning={scan.scanning}
            scanProgress={scan.progress}
            count={scan.count}
            syncing={sync.syncing}
            syncProgress={sync.progress}
          />
        )}
        {sync.lastSync && <SyncGrids notes={sync.lastSync.notes} />}
        {error && <Message tone="error">{error}</Message>}
      </main>
    </div>
  )
}
