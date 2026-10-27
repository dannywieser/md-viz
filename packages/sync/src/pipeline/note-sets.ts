import type { Source } from '../types'
import type { Note } from './notes'

const DAY_MS = 24 * 60 * 60 * 1000
const RECENT_DAYS = 30

export interface NoteSet {
  /** the cache set id: `<source>:<name>`. */
  id: string
  noteIds: string[]
}

type DateField = 'created' | 'modified'

interface SetDefinition {
  name: string
  field: DateField
  /** whether `time` (ms since epoch) belongs in the set at `now`. */
  includes: (time: number, now: Date) => boolean
}

const inToday = (time: number, now: Date) => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime()
  return time >= start && time < end
}

const inLastDays = (time: number, now: Date) => time >= now.getTime() - RECENT_DAYS * DAY_MS

const DEFINITIONS: SetDefinition[] = [
  { name: 'created-today', field: 'created', includes: inToday },
  { name: 'modified-today', field: 'modified', includes: inToday },
  { name: 'created-last-30-days', field: 'created', includes: inLastDays },
  { name: 'modified-last-30-days', field: 'modified', includes: inLastDays },
]

/** the file source cannot tell when a note was created, so it gets no `created` sets. */
function appliesTo(source: Source, definition: SetDefinition): boolean {
  return source !== 'file' || definition.field !== 'created'
}

/**
 * the automatic sets of one source at `now` (the PC's clock): today is the local calendar day,
 * the last 30 days are a rolling 30 x 24 hours. notes with a missing or unparseable date are
 * left out of the sets that use it. a set with no members is still returned.
 */
export function buildNoteSets(source: Source, notes: Note[], now: Date): NoteSet[] {
  return DEFINITIONS.filter((definition) => appliesTo(source, definition)).map((definition) => ({
    id: `${source}:${definition.name}`,
    noteIds: notes
      .filter((note) => {
        const time = Date.parse(note[definition.field])
        return !Number.isNaN(time) && definition.includes(time, now)
      })
      .map((note) => note.id),
  }))
}
