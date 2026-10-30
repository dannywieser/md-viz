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

type When = 'today' | 'last-30-days'

/** the sync sets in rank order: the narrower period of each kind comes first. */
const NAMES = [
  'created-today',
  'created-last-30-days',
  'updated-today',
  'updated-last-30-days',
  'deleted-today',
  'deleted-last-30-days',
  'unchanged',
] as const

const isToday = (time: number, now: Date) => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime()
  return time >= start && time < end
}

const isRecent = (time: number, now: Date) => time >= now.getTime() - RECENT_DAYS * DAY_MS

const within = (when: When, value: string | undefined, now: Date) => {
  const time = Date.parse(value ?? '')
  return !Number.isNaN(time) && (when === 'today' ? isToday(time, now) : isRecent(time, now))
}

/**
 * the sets of the `sync` grouping of one source at `now` (the PC's clock): today is the local
 * calendar day, the last 30 days are a rolling 30 x 24 hours. updated is the cache's `synced`
 * time, created the note's `created`, deleted the cache's `deleted` time; unchanged is every
 * note that exists and was not updated in the last 30 days. a note with a missing or
 * unparseable time is left out of the sets that use it. a deleted note is only in the deleted
 * sets. the file source cannot tell when a note was created, so it gets no created sets. a set
 * with no members is still returned.
 */
export function buildSyncSets(source: Source, notes: TimedNote[], now: Date): GroupSet[] {
  const live = notes.filter((note) => note.deleted === undefined)
  const gone = notes.filter((note) => note.deleted !== undefined)

  const members = (name: (typeof NAMES)[number]): string[] => {
    const when = name.endsWith('today') ? 'today' : 'last-30-days'
    const pick = (list: TimedNote[], field: 'created' | 'synced' | 'deleted') =>
      list.filter((note) => within(when, note[field], now))
    switch (name) {
      case 'created-today':
      case 'created-last-30-days':
        return pick(live, 'created').map((note) => note.id)
      case 'updated-today':
      case 'updated-last-30-days':
        return pick(live, 'synced').map((note) => note.id)
      case 'deleted-today':
      case 'deleted-last-30-days':
        return pick(gone, 'deleted').map((note) => note.id)
      case 'unchanged':
        return live.filter((note) => !within('last-30-days', note.synced, now)).map((n) => n.id)
    }
  }

  return NAMES.map((name, rank) => ({ id: name, rank, noteIds: members(name) })).filter(
    ({ id }) => source !== 'file' || !id.startsWith('created-'),
  )
}
