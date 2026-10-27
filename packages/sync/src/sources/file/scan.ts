import type { ScanProgress, ScanResult } from '../../types'
import { walkMarkdown } from './walk'

export interface ScanOptions {
  /** minimum time between progress callbacks; the final state is always reported. */
  progressIntervalMs?: number
}

/**
 * counts `.md` files under `root`, recursively. dot-directories and
 * `node_modules` are skipped; symlinks are not followed; unreadable
 * directories are ignored.
 */
export async function scanMarkdown(
  root: string,
  onProgress?: (progress: ScanProgress) => void,
  { progressIntervalMs = 50 }: ScanOptions = {},
): Promise<ScanResult> {
  const progress: ScanProgress = { dirs: 0, mdFiles: 0 }
  let lastReport = Number.NEGATIVE_INFINITY

  const report = (force = false) => {
    if (!onProgress) return
    const now = performance.now()
    if (!force && now - lastReport < progressIntervalMs) return
    lastReport = now
    onProgress({ ...progress })
  }

  const onDir = () => {
    progress.dirs += 1
    report()
  }

  for await (const file of walkMarkdown(root, onDir)) {
    void file
    progress.mdFiles += 1
  }
  report(true)
  return { count: progress.mdFiles }
}
