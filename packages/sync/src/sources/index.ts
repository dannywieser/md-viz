import type { Source, SyncTarget } from '../types'
import { bearSource } from './bear'
import { fileSource } from './file'
import type { SourceAdapter } from './types'

/** every source, by name. a `Source` without an entry here does not type-check. */
export const sources = {
  file: fileSource,
  bear: bearSource,
} satisfies { [S in Source]: SourceAdapter<Extract<SyncTarget, { source: S }>> }

/**
 * the adapter that reads `target`. TypeScript cannot tie a target to its own source's adapter
 * through a union, so this is the one cast: `target.source` picks the adapter made for it.
 */
export function adapterFor(target: SyncTarget): SourceAdapter<SyncTarget> {
  return sources[target.source] as SourceAdapter<SyncTarget>
}
