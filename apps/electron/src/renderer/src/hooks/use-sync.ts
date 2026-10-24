import { useState } from 'react'
import type { LastSync, SyncProgress } from '../../../shared/ipc'
import { errorMessage } from '../lib/error-message'

/** the last sync of the chosen folder; `sync` pushes the folder to the cache. */
export function useSync(folder: string | null, onError: (message: string | null) => void) {
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState<SyncProgress | null>(null)
  const [lastSync, setLastSync] = useState<LastSync | null>(null)

  /** forget the progress and show `saved` as the last sync, for a newly chosen folder. */
  const reset = (saved: LastSync | null) => {
    setLastSync(saved)
    setProgress(null)
  }

  const sync = async () => {
    if (!folder) return
    setProgress(null)
    onError(null)
    setSyncing(true)
    const unsubscribe = window.api.onSyncProgress(setProgress)
    try {
      const result = await window.api.sync({ source: 'file', folder })
      setLastSync({ syncedAt: new Date().toISOString(), notes: result.notes })
    } catch (err) {
      onError(errorMessage(err))
    } finally {
      unsubscribe()
      setSyncing(false)
    }
  }

  return { syncing, progress, lastSync, reset, sync }
}
