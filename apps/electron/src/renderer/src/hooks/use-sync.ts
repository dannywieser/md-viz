import { useState } from 'react'
import type { LastSync, SyncProgress, SyncTarget } from '../../../shared/ipc'
import { errorMessage } from '../lib/error-message'

/** the last sync of the chosen source; `sync` pushes its notes to the cache. */
export function useSync(target: SyncTarget | null, onError: (message: string | null) => void) {
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState<SyncProgress | null>(null)
  const [lastSync, setLastSync] = useState<LastSync | null>(null)

  /** forget the progress and show `saved` as the last sync, for a newly chosen source. */
  const reset = (saved: LastSync | null) => {
    setLastSync(saved)
    setProgress(null)
  }

  const sync = async () => {
    if (!target) return
    setProgress(null)
    onError(null)
    setSyncing(true)
    const unsubscribe = window.api.onSyncProgress(setProgress)
    try {
      const result = await window.api.sync(target)
      setLastSync({
        syncedAt: new Date().toISOString(),
        notes: result.notes,
      })
    } catch (err) {
      onError(errorMessage(err))
    } finally {
      unsubscribe()
      setSyncing(false)
    }
  }

  return { syncing, progress, lastSync, reset, sync }
}
