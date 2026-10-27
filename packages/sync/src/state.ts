import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { LastSync, Source, SyncTarget } from './types'

export interface AppState {
  /** the source selected when the app last ran. */
  lastSource: Source
  /** the folder last chosen for the file source. */
  lastFolder: string | null
  /** the last completed sync, by `syncKey`. */
  syncs: Record<string, LastSync>
}

const emptyState = (): AppState => ({ lastSource: 'file', lastFolder: null, syncs: {} })

/** the key of a target's last sync: one per folder for files, one for Bear. */
export function syncKey(target: SyncTarget): string {
  return target.source === 'bear' ? 'bear' : `file:${target.folder}`
}

/** reads the state file; a missing or unreadable file gives an empty state. */
export async function readState(file: string): Promise<AppState> {
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8')) as Partial<AppState> | null
    return {
      lastSource: parsed?.lastSource === 'bear' ? 'bear' : 'file',
      lastFolder: typeof parsed?.lastFolder === 'string' ? parsed.lastFolder : null,
      syncs: parsed?.syncs && typeof parsed.syncs === 'object' ? parsed.syncs : {},
    }
  } catch {
    return emptyState()
  }
}

/** writes the state file through a temporary file so a crash cannot leave it half-written. */
export async function writeState(file: string, state: AppState): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true })
  const temp = `${file}.tmp`
  await writeFile(temp, JSON.stringify(state))
  await rename(temp, file)
}

/** reads the state, applies `change` to it and writes it back. */
export async function updateState(file: string, change: (state: AppState) => void): Promise<void> {
  const state = await readState(file)
  change(state)
  await writeState(file, state)
}
