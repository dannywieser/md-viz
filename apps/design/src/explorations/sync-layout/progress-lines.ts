import type { Detail, FakeProgress } from './fake-sync'
import type { Phase } from './fake-sync'

export interface ProgressText {
  label: string
  line: string
  count: string
  bar: { value: number; max: number } | null
}

/** what the progress display says at this point of a scan or a sync; null in the other phases. */
export function progressText(
  phase: Phase,
  detail: Detail,
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
    const what =
      detail === 'note' ? sync.title : `notes ${sync.batch[0]}–${sync.batch[1]} of ${sync.total}`
    return {
      label: 'syncing',
      line: `syncing ${what}`,
      count: `${sync.done} of ${sync.total} pushed`,
      bar: { value: sync.done, max: sync.total },
    }
  }
  return null
}
