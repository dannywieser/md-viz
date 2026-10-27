import { stat } from 'node:fs/promises'
import path from 'node:path'
import type { Source, SyncTarget } from './types'

/** checks that `folder` is an absolute path to an existing directory and returns it. */
export async function assertDirectory(folder: unknown): Promise<string> {
  if (typeof folder !== 'string' || !path.isAbsolute(folder)) {
    throw new Error('expected an absolute folder path')
  }
  if (!(await stat(folder)).isDirectory()) {
    throw new Error('not a directory')
  }
  return folder
}

/** checks what a caller sent as a target: a source, plus an existing absolute folder for files. */
export async function parseTarget(target: unknown): Promise<SyncTarget> {
  const { source, folder } = (target ?? {}) as { source?: unknown; folder?: unknown }
  if (source === 'bear') return { source }
  if (source === 'file') return { source, folder: await assertDirectory(folder) }
  throw new Error('expected a source')
}

/** checks that `source` is one of the known sources. */
export function parseSource(source: unknown): Source {
  if (source !== 'file' && source !== 'bear') throw new Error('expected a source')
  return source
}
