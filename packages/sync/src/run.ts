import { readState, updateState, type AppState } from './state'
import { syncNotes } from './pipeline/sync'
import { adapterFor, adapterOf } from './sources'
import { parseSource, parseTarget } from './target'
import type {
  LastSelection,
  ScanProgress,
  ScanResult,
  Source,
  SyncProgress,
  SyncResult,
  SyncTarget,
} from './types'

export interface SyncRunOptions {
  /** the state file the last selection and sync are kept in. */
  stateFile: string
  /** the base URL of the note cache. */
  cacheUrl: string
  onProgress?: (progress: SyncProgress) => void
}

/** the target `source` remembers in `state` and the last sync of it. */
async function selectionOf(source: Source, state: AppState): Promise<LastSelection> {
  const adapter = adapterOf(source)
  const target = await adapter.restore(state)
  if (!target) return { source, folder: null, lastSync: null }
  return {
    source,
    folder: 'folder' in target ? target.folder : null,
    lastSync: state.syncs[adapter.key(target)] ?? null,
  }
}

/** makes `target` the selected one and lets its source keep what it needs to bring it back. */
function remember(state: AppState, target: SyncTarget): void {
  state.lastSource = target.source
  adapterFor(target).remember(state, target)
}

/** counts the notes of a target (`target` is validated first): files under the folder, or Bear's. */
export async function scanTarget(
  target: unknown,
  onProgress?: (progress: ScanProgress) => void,
): Promise<ScanResult> {
  const checked = await parseTarget(target)
  return adapterFor(checked).scan(checked, onProgress)
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
  const adapter = adapterFor(checked)
  const loaded = await adapter.load(checked)
  const result = await syncNotes(checked.source, loaded, { baseUrl: cacheUrl, onProgress })
  const syncedAt = new Date().toISOString()
  await updateState(stateFile, (state) => {
    remember(state, checked)
    state.syncs[adapter.key(checked)] = {
      syncedAt,
      notes: result.notes,
      tagColors: result.tagColors,
    }
  })
  return result
}

/** remembers a folder the user picked as the file source's folder (and the file source). */
export async function rememberFolder(stateFile: string, folder: string): Promise<void> {
  await updateState(stateFile, (state) => remember(state, { source: 'file', folder }))
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
