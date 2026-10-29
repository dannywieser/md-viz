import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { isSource } from './sources'
import type { LastSync, NoteRef, Source, TagColors } from './types'

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** a note of a saved sync; files from before tags were kept have none. */
function readRef(value: unknown): NoteRef | null {
  if (!isRecord(value) || typeof value['id'] !== 'string' || typeof value['title'] !== 'string') {
    return null
  }
  const tags = Array.isArray(value['tags'])
    ? value['tags'].filter((tag): tag is string => typeof tag === 'string')
    : []
  return { id: value['id'], title: value['title'], tags }
}

const readRefs = (value: unknown): NoteRef[] =>
  Array.isArray(value) ? value.flatMap((ref) => readRef(ref) ?? []) : []

/** the tag colours of a saved sync; files from before they were kept have none. */
function readTagColors(value: unknown): TagColors {
  if (!isRecord(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, number] => typeof entry[1] === 'number',
    ),
  )
}

/** the saved syncs that are readable, completed with what older files lack. */
function readSyncs(value: unknown): Record<string, LastSync> {
  if (!isRecord(value)) return {}
  const syncs = new Map<string, LastSync>()
  for (const [key, sync] of Object.entries(value)) {
    if (!isRecord(sync) || typeof sync['syncedAt'] !== 'string' || !isRecord(sync['notes']))
      continue
    syncs.set(key, {
      syncedAt: sync['syncedAt'],
      notes: {
        updated: readRefs(sync['notes']['updated']),
        deleted: readRefs(sync['notes']['deleted']),
        unchanged: readRefs(sync['notes']['unchanged']),
      },
      tagColors: readTagColors(sync['tagColors']),
    })
  }
  return Object.fromEntries(syncs)
}

/** reads the state file; a missing or unreadable file gives an empty state. */
export async function readState(file: string): Promise<AppState> {
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8')) as Partial<AppState> | null
    const lastSource = parsed?.lastSource
    return {
      lastSource: isSource(lastSource) ? lastSource : DEFAULT_SOURCE,
      lastFolder: typeof parsed?.lastFolder === 'string' ? parsed.lastFolder : null,
      syncs: readSyncs(parsed?.syncs),
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
