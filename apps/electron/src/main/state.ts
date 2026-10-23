import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { LastSync } from '../shared/ipc'

export interface AppState {
  /** the folder selected when the app last ran. */
  lastFolder: string | null
  /** the last completed sync, by folder path. */
  syncs: Record<string, LastSync>
}

const emptyState = (): AppState => ({ lastFolder: null, syncs: {} })

/** reads the state file; a missing or unreadable file gives an empty state. */
export async function readState(file: string): Promise<AppState> {
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8')) as Partial<AppState> | null
    return {
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
