import { useEffect, useState } from 'react'
import { AppHeader, Button, Card } from '@md-viz/ui'
import type { LastSync, ScanProgress, SyncProgress } from '../../shared/ipc'
import { SyncGrids } from './SyncGrids'

// room in the header for the window controls drawn over it: the macOS traffic lights on the left,
// the windows and linux buttons on the right.
const headerClearance = navigator.userAgent.includes('Macintosh') ? 'pl-24' : 'pr-40'

const formatTime = (iso: string) => new Date(iso).toLocaleString().toLowerCase()

export function App() {
  const [folder, setFolder] = useState<string | null>(null)
  const [progress, setProgress] = useState<ScanProgress | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [scanning, setScanning] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null)
  const [lastSync, setLastSync] = useState<LastSync | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectFolder = async (picked: string, saved: LastSync | null = null) => {
    setFolder(picked)
    setLastSync(saved)
    setCount(null)
    setProgress(null)
    setSyncProgress(null)
    setError(null)
    setScanning(true)
    const unsubscribe = window.api.onScanProgress(setProgress)
    try {
      const result = await window.api.scanFolder(picked)
      setCount(result.mdCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      unsubscribe()
      setScanning(false)
    }
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
  }, [])

  const sync = async () => {
    if (!folder) return
    setSyncProgress(null)
    setError(null)
    setSyncing(true)
    const unsubscribe = window.api.onSyncProgress(setSyncProgress)
    try {
      const result = await window.api.syncFolder(folder)
      setLastSync({ syncedAt: new Date().toISOString(), notes: result.notes })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      unsubscribe()
      setSyncing(false)
    }
  }

  const busy = scanning || syncing

  return (
    <div className="flex h-screen flex-col">
      <AppHeader title="md-viz sync" subtitle="sync" className={headerClearance}>
        <Button onClick={() => void chooseFolder()} disabled={busy}>
          choose folder
        </Button>
        <Button onClick={() => void sync()} disabled={busy || !folder}>
          sync
        </Button>
      </AppHeader>
      <main className="flex flex-1 flex-col items-start gap-8 overflow-auto p-4 pt-8">
        {folder && (
          <Card className="max-w-full gap-2 px-4 py-3">
            <p className="break-all text-sm" aria-label="chosen folder">
              {folder}
            </p>
            <p className="text-sm text-muted-foreground">
              {lastSync ? `last synced ${formatTime(lastSync.syncedAt)}` : 'never synced'}
            </p>
            {scanning && progress && (
              <p role="status" className="text-sm">
                scanning… {progress.dirs} folders, {progress.mdFiles} notes so far
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
        )}
        {lastSync && <SyncGrids notes={lastSync.notes} />}
        {error && (
          <Card className="px-4 py-3">
            <p role="alert" className="text-sm text-destructive">
              {error.toLowerCase()}
            </p>
          </Card>
        )}
      </main>
    </div>
  )
}
