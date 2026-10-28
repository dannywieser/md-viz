import type { FakeProgress, Phase } from './fake-sync'

export interface ProgressText {
  label: string
  line: string
  count: string
  bar: { value: number; max: number } | null
}

/** what the progress display says at this point of a scan or a sync; null in the other phases. */
export function progressText(
  phase: Phase,
  sync: FakeProgress,
  scan: { dirs: number; mdFiles: number },
): ProgressText | null {
  if (phase === 'scanning') {
    return {
      label: 'scanning',
      line: 'scanning the folder…',
      count: `${scan.dirs} folders, ${scan.mdFiles} notes so far`,
      bar: null,
    }
  }
  if (phase === 'syncing') {
    return {
      label: 'syncing',
      line: 'syncing notes to the cache…',
      count: `${sync.synced} pushed, ${sync.deleted} deleted of ${sync.total}`,
      bar: { value: sync.synced + sync.deleted, max: sync.total },
    }
  }
  return null
}
