/** a mock note: the three-grid layout of this exploration predates the sets, so its notes only have a title. */
export type Note = { id: string; title: string }

/** what the sync app is doing, or has done, in a mock window. */
export type Phase = 'never' | 'scanning' | 'syncing' | 'done' | 'empty' | 'error'

export const phases: Phase[] = ['never', 'scanning', 'syncing', 'done', 'empty', 'error']

export const SOURCE = '~/notes/homelab'
export const LAST_SYNCED = '2026-10-26 18:04'
/** notes the sync pushes. */
export const TO_PUSH = 240
/** notes the sync deletes from the cache, after the pushes. */
export const TO_DELETE = 6

const FIRST = ['garden', 'recipe', 'meeting', 'idea', 'budget', 'travel', 'reading', 'project']
const SECOND = ['plan', 'notes', 'draft', 'ideas', 'list', 'review', 'summary', 'log', 'sketch']

/** deterministic placeholder titles, so a mock always looks the same. */
export const titleAt = (index: number) =>
  `${FIRST[index % FIRST.length]} ${SECOND[Math.floor(index / FIRST.length) % SECOND.length]} ${index + 1}`

/** `count` placeholder notes. */
export const makeNotes = (count: number, offset = 0): Note[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `note-${offset + i}`,
    title: titleAt(offset + i),
  }))

export interface FakeGroups {
  updated: Note[]
  deleted: Note[]
  unchanged: Note[]
}

/** the three groups of a finished sync. */
export const doneGroups = (): FakeGroups => ({
  updated: makeNotes(TO_PUSH, 1000),
  deleted: makeNotes(TO_DELETE, 2000),
  unchanged: makeNotes(412, 3000),
})

export const emptyGroups = (): FakeGroups => ({ updated: [], deleted: [], unchanged: [] })

export interface FakeProgress {
  /** notes pushed so far. */
  synced: number
  /** notes deleted so far; the pipeline deletes after it has pushed. */
  deleted: number
  /** notes to push plus notes to delete. */
  total: number
}

/** the sync progress at `percent` (0-100) of the way through: everything is pushed, then deleted. */
export function syncProgress(percent: number): FakeProgress {
  const total = TO_PUSH + TO_DELETE
  const processed = Math.round((total * percent) / 100)
  const synced = Math.min(processed, TO_PUSH)
  return {
    synced,
    deleted: Math.max(0, processed - TO_PUSH),
    total,
  }
}

/** the scan progress at `percent` (0-100) of the way through. */
export const scanProgress = (percent: number) => ({
  dirs: Math.round(percent * 1.6),
  mdFiles: Math.round(percent * 4.1),
})
