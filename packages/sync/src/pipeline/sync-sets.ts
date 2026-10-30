import type { Source } from '../types'
import type { GroupSet } from './tag-sets'

const DAY_MS = 24 * 60 * 60 * 1000
const RECENT_DAYS = 30

/** a cached note as far as the sync sets are concerned; times are ISO strings, missing ones empty or absent. */
export interface TimedNote {
  id: string
  /** when the cache last stored the note. */
  synced?: string | undefined
  /** when the note was created, if the source knows. */
  created?: string | undefined
  /** when the note was deleted from the source; absent while it exists. */
  deleted?: string | undefined
}

/**
 * the sync sets in rank order, which is also the order a note is tried against them: the first set
 * it fits is its only one. today comes before the 30 days of the same kind, and creating before
 * updating.
 */
const NAMES = [
  'created-today',
  'updated-today',
  'created-last-30-days',
  'updated-last-30-days',
  'deleted-today',
  'deleted-last-30-days',
  'unchanged',
] as const

type Name = (typeof NAMES)[number]

const isToday = (time: number, now: Date) => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime()
  return time >= start && time < end
}

const isRecent = (time: number, now: Date) => time >= now.getTime() - RECENT_DAYS * DAY_MS

const within = (period: 'today' | 'last-30-days', value: string | undefined, now: Date) => {
  const time = Date.parse(value ?? '')
  return !Number.isNaN(time) && (period === 'today' ? isToday(time, now) : isRecent(time, now))
}

/** the one set a note is in, or none for a deleted note deleted more than 30 days ago (or with no readable time). */
function setOf(note: TimedNote, now: Date, skipCreated: boolean): Name | undefined {
  if (note.deleted !== undefined) {
    if (within('today', note.deleted, now)) return 'deleted-today'
    return within('last-30-days', note.deleted, now) ? 'deleted-last-30-days' : undefined
  }
  if (!skipCreated && within('today', note.created, now)) return 'created-today'
  if (within('today', note.synced, now)) return 'updated-today'
  if (!skipCreated && within('last-30-days', note.created, now)) return 'created-last-30-days'
  if (within('last-30-days', note.synced, now)) return 'updated-last-30-days'
  return 'unchanged'
}

/**
 * the sets of the `sync` grouping of one source at `now` (the PC's clock): today is the local
 * calendar day, the last 30 days are a rolling 30 x 24 hours. updated is the cache's `synced`
 * time, created the note's `created`, deleted the cache's `deleted` time. a note is in exactly one
 * set, the first it fits in the rank order (see `NAMES`); unchanged is every other note that
 * exists. a deleted note is only in a deleted set, and in none when it was deleted more than 30
 * days ago or its time cannot be read. a live note with an unreadable time is left out of the sets
 * that use it. the file source cannot tell when a note was created, so it gets no created sets.
 * a set with no members is still returned.
 */
export function buildSyncSets(source: Source, notes: TimedNote[], now: Date): GroupSet[] {
  const skipCreated = source === 'file'
  const members = new Map<Name, string[]>(NAMES.map((name) => [name, []]))
  for (const note of notes) {
    const name = setOf(note, now, skipCreated)
    if (name !== undefined) members.get(name)?.push(note.id)
  }
  return NAMES.map((name, rank) => ({ id: name, rank, noteIds: members.get(name) ?? [] })).filter(
    ({ id }) => !skipCreated || !id.startsWith('created-'),
  )
}
