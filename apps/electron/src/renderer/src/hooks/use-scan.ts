import { useState } from 'react'
import type { ScanProgress } from '../../../shared/ipc'
import { errorMessage } from '../lib/error-message'

/** the chosen folder and its note count; `scan` picks a folder and counts its notes. */
export function useScan(onError: (message: string | null) => void) {
  const [folder, setFolder] = useState<string | null>(null)
  const [progress, setProgress] = useState<ScanProgress | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [scanning, setScanning] = useState(false)

  const scan = async (picked: string) => {
    setFolder(picked)
    setCount(null)
    setProgress(null)
    onError(null)
    setScanning(true)
    const unsubscribe = window.api.onScanProgress(setProgress)
    try {
      const result = await window.api.scan({ source: 'file', folder: picked })
      setCount(result.count)
    } catch (err) {
      onError(errorMessage(err))
    } finally {
      unsubscribe()
      setScanning(false)
    }
  }

  return { folder, progress, count, scanning, scan }
}
