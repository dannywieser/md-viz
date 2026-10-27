import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { isSource } from './sources'
import type { LastSync, Source } from './types'

export interface AppState {
  /** the source selected when the app last ran. */
  lastSource: Source
  /** the folder last chosen for the file source (the file source owns this field). */
  lastFolder: string | null
  /** the last completed sync, by the key its source gives the target. */
  syncs: Record<string, LastSync>
}

/** the source selected when no state has been saved yet. */
const DEFAULT_SOURCE: Source = 'file'

const emptyState = (): AppState => ({ lastSource: DEFAULT_SOURCE, lastFolder: null, syncs: {} })

/** reads the state file; a missing or unreadable file gives an empty state. */
export async function readState(file: string): Promise<AppState> {
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8')) as Partial<AppState> | null
    const lastSource = parsed?.lastSource
    return {
      lastSource: isSource(lastSource) ? lastSource : DEFAULT_SOURCE,
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
