import { useState } from 'react'
import { AppHeader, Button, Card, CardContent } from '@md-viz/ui'
import type { ScanProgress, SyncProgress, SyncResult } from '../../shared/ipc'

export function App() {
  const [folder, setFolder] = useState<string | null>(null)
  const [progress, setProgress] = useState<ScanProgress | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [scanning, setScanning] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const chooseFolder = async () => {
    const picked = await window.api.pickFolder()
    if (!picked) return

    setFolder(picked)
    setCount(null)
    setProgress(null)
    setSyncResult(null)
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

  const sync = async () => {
    if (!folder) return
    setSyncResult(null)
    setSyncProgress(null)
    setError(null)
    setSyncing(true)
    const unsubscribe = window.api.onSyncProgress(setSyncProgress)
    try {
      setSyncResult(await window.api.syncFolder(folder))
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
      <AppHeader title="md-viz" />
      <main className="flex-1 overflow-auto p-4">
        <Card className="min-h-full w-full">
          <CardContent className="flex flex-col gap-4">
            <div>
              <div className="flex gap-2">
                <Button onClick={() => void chooseFolder()} disabled={busy}>
                  choose folder
                </Button>
                <Button onClick={() => void sync()} disabled={busy || !folder}>
                  sync
                </Button>
              </div>
            </div>
            {folder && (
              <p className="break-all text-sm" aria-label="chosen folder">
                {folder}
              </p>
            )}
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
            {syncResult && (
              <p role="status" className="text-sm">
                synced {syncResult.synced}, deleted {syncResult.deleted}, unchanged{' '}
                {syncResult.unchanged}
                {syncResult.failed > 0 && `, ${syncResult.failed} unreadable`}
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error.toLowerCase()}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
