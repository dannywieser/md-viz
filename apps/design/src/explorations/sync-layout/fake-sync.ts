import { DEFAULT_NOTE_COLOR, type Note } from '@md-viz/ui'

/** what the sync app is doing, or has done, in a mock window. */
export type Phase = 'never' | 'scanning' | 'syncing' | 'done' | 'empty' | 'error'

export const phases: Phase[] = ['never', 'scanning', 'syncing', 'done', 'empty', 'error']

/** how the pipeline reports what it is pushing: a batch at a time (today) or each note. */
export type Detail = 'batch' | 'note'

export const details: Detail[] = ['batch', 'note']

export const SOURCE = '~/notes/homelab'
export const LAST_SYNCED = '2026-10-26 18:04'
/** notes in the sync being reported, which is how many it pushes. */
export const TO_PUSH = 240
/** the pipeline upserts this many notes per request. */
export const BATCH_SIZE = 50

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
    color: DEFAULT_NOTE_COLOR,
  }))

export interface FakeGroups {
  updated: Note[]
  deleted: Note[]
  unchanged: Note[]
}

/** the three groups of a finished sync. */
export const doneGroups = (): FakeGroups => ({
  updated: makeNotes(TO_PUSH, 1000),
  deleted: makeNotes(6, 2000),
  unchanged: makeNotes(412, 3000),
})

export const emptyGroups = (): FakeGroups => ({ updated: [], deleted: [], unchanged: [] })

export interface FakeProgress {
  /** notes pushed so far. */
  done: number
  total: number
  /** the note being pushed, or the first of the batch. */
  title: string
  /** `[from, to]` positions (1-based) of the batch in progress. */
  batch: [number, number]
}

/** the sync progress at `percent` (0-100) of the way through. */
export function syncProgress(percent: number): FakeProgress {
  const done = Math.round((TO_PUSH * percent) / 100)
  const first = Math.floor(Math.min(done, TO_PUSH - 1) / BATCH_SIZE) * BATCH_SIZE
  return {
    done,
    total: TO_PUSH,
    title: titleAt(1000 + Math.min(done, TO_PUSH - 1)),
    batch: [first + 1, Math.min(first + BATCH_SIZE, TO_PUSH)],
  }
}

/** the scan progress at `percent` (0-100) of the way through. */
export const scanProgress = (percent: number) => ({
  dirs: Math.round(percent * 1.6),
  mdFiles: Math.round(percent * 4.1),
})
