import { useState } from 'react'
import type { ScanProgress, SyncTarget } from '../../../shared/ipc'
import { errorMessage } from '../lib/error-message'

/** the chosen source and its note count; `scan` chooses a source and counts its notes. */
export function useScan(onError: (message: string | null) => void) {
  const [target, setTarget] = useState<SyncTarget | null>(null)
  const [progress, setProgress] = useState<ScanProgress | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [scanning, setScanning] = useState(false)

  const scan = async (chosen: SyncTarget) => {
    setTarget(chosen)
    setCount(null)
    setProgress(null)
    onError(null)
    setScanning(true)
    const unsubscribe = window.api.onScanProgress(setProgress)
    try {
      const result = await window.api.scan(chosen)
      setCount(result.count)
    } catch (err) {
      onError(errorMessage(err))
    } finally {
      unsubscribe()
      setScanning(false)
    }
  }

  /** forgets the chosen source, for a file source that has no folder yet. */
  const clear = () => {
    setTarget(null)
    setCount(null)
    setProgress(null)
  }

  return { target, progress, count, scanning, scan, clear }
}
