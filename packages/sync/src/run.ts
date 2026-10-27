import { loadBearNotes } from './load-bear-notes'
import { loadFileNotes } from './load-file-notes'
import { scanBear } from './scan-bear'
import { scanMarkdown } from './scan'
import { readState, syncKey, updateState, type AppState } from './state'
import { syncNotes } from './sync'
import { assertDirectory, parseSource, parseTarget } from './target'
import type {
  LastSelection,
  ScanProgress,
  ScanResult,
  Source,
  SyncProgress,
  SyncResult,
} from './types'

export interface SyncRunOptions {
  /** the state file the last selection and sync are kept in. */
  stateFile: string
  /** the base URL of the note cache. */
  cacheUrl: string
  onProgress?: (progress: SyncProgress) => void
}

/** the folder and last sync of `source` as the state has them. */
async function selectionOf(source: Source, state: AppState): Promise<LastSelection> {
  if (source === 'bear') return { source, folder: null, lastSync: state.syncs['bear'] ?? null }
  let folder: string | null = null
  if (state.lastFolder) {
    try {
      folder = await assertDirectory(state.lastFolder)
    } catch {
      // the folder is gone: show no folder.
    }
  }
  const lastSync = folder ? (state.syncs[syncKey({ source, folder })] ?? null) : null
  return { source, folder, lastSync }
}

/** counts the notes of a target (`target` is validated first): files under the folder, or Bear's. */
export async function scanTarget(
  target: unknown,
  onProgress?: (progress: ScanProgress) => void,
): Promise<ScanResult> {
  const checked = await parseTarget(target)
  if (checked.source === 'bear') return scanBear()
  return scanMarkdown(checked.folder, onProgress)
}

/**
 * loads the notes of a target (validated first), syncs them to the cache and records the sync in
 * the state file as the last one of that target. nothing is recorded when loading or syncing
 * fails.
 */
export async function syncTarget(
  target: unknown,
  { stateFile, cacheUrl, onProgress }: SyncRunOptions,
): Promise<SyncResult> {
  const checked = await parseTarget(target)
  const loaded =
    checked.source === 'bear' ? await loadBearNotes() : await loadFileNotes(checked.folder)
  const result = await syncNotes(checked.source, loaded, { baseUrl: cacheUrl, onProgress })
  const syncedAt = new Date().toISOString()
  await updateState(stateFile, (state) => {
    state.lastSource = checked.source
    if (checked.source === 'file') state.lastFolder = checked.folder
    state.syncs[syncKey(checked)] = { syncedAt, notes: result.notes }
  })
  return result
}

/** remembers a folder the user picked as the file source's folder (and the file source). */
export async function rememberFolder(stateFile: string, folder: string): Promise<void> {
  await updateState(stateFile, (state) => {
    state.lastSource = 'file'
    state.lastFolder = folder
  })
}

/** remembers `source` as the selected one and returns its folder and last sync. */
export async function selectSource(source: unknown, stateFile: string): Promise<LastSelection> {
  const checked = parseSource(source)
  await updateState(stateFile, (state) => void (state.lastSource = checked))
  return selectionOf(checked, await readState(stateFile))
}

/** the selection of the previous run; a file source's folder is null once it is gone. */
export async function loadLastSelection(stateFile: string): Promise<LastSelection> {
  const state = await readState(stateFile)
  return selectionOf(state.lastSource, state)
}
