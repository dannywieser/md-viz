import type { Source, SyncTarget } from '../types'
import { bearSource } from './bear'
import { fileSource } from './file'
import type { SourceAdapter } from './types'

/** every source, by name. a `Source` without an entry here does not type-check. */
export const sources = {
  file: fileSource,
  bear: bearSource,
} satisfies { [S in Source]: SourceAdapter<Extract<SyncTarget, { source: S }>> }

/** whether `value` names a registered source. */
export function isSource(value: unknown): value is Source {
  return typeof value === 'string' && Object.hasOwn(sources, value)
}

/**
 * the adapter of `source`. TypeScript cannot tie a target to its own source's adapter through a
 * union, so this is the one cast: `source` picks the adapter made for it.
 */
export function adapterOf(source: Source): SourceAdapter<SyncTarget> {
  return sources[source] as SourceAdapter<SyncTarget>
}

/** the adapter that reads `target`. */
export function adapterFor(target: SyncTarget): SourceAdapter<SyncTarget> {
  return adapterOf(target.source)
}
