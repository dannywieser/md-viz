import { adapterOf, isSource } from './sources'
import type { Source, SyncTarget } from './types'

/** checks that `source` is one of the registered sources. */
export function parseSource(source: unknown): Source {
  if (!isSource(source)) throw new Error('expected a source')
  return source
}

/** checks what a caller sent as a target; the named source validates the rest of it. */
export async function parseTarget(target: unknown): Promise<SyncTarget> {
  const input = (target ?? {}) as Record<string, unknown>
  return await adapterOf(parseSource(input['source'])).parse(input)
}
