import { useEffect, useState } from 'react'
import type { NoteSet, Source } from '../../../shared/ipc'
import { errorMessage } from '../lib/error-message'

/**
 * the sets of the `sync` grouping of `source` as the cache holds them, with their notes; null until
 * they are loaded, and again while another source's are. they are loaded when `enabled` turns on
 * and again whenever the source or `syncedAt` (when the last sync completed) changes, since a sync
 * replaces them.
 */
export function useSets(
  source: Source,
  syncedAt: string | undefined,
  enabled: boolean,
  onError: (message: string | null) => void,
) {
  const [loaded, setLoaded] = useState<{ source: Source; sets: NoteSet[] } | null>(null)

  useEffect(() => {
    if (!enabled) return
    let current = true
    window.api
      .sets(source)
      .then((sets) => {
        if (current) setLoaded({ source, sets })
      })
      .catch((err: unknown) => {
        if (current) onError(errorMessage(err))
      })
    return () => {
      current = false
    }
  }, [source, syncedAt, enabled, onError])

  return loaded?.source === source ? loaded.sets : null
}
