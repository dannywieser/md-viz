import { DatabaseSync } from 'node:sqlite'

/** Field the service writes itself on every upsert; client values for it are overwritten. */
export const SYNCED_FIELD = 'synced'

/** Field the service writes when a note is deleted (an ISO time); an upsert removes it again. */
export const DELETED_FIELD = 'deleted'

export type Fields = Record<string, string>

export interface NoteInput {
  id: string
  fields: Fields
}

/** the three fields that identify a set: where its notes come from, how they are grouped, its name. */
export interface SetKey {
  source: string
  grouping: string
  id: string
}

export interface SetInput {
  /** index into the note palette; the cache does not interpret it. */
  color: number
  /** order within the grouping, lower first; the cache does not interpret it. */
  rank: number
  noteIds: string[]
}

export interface SetSummary extends SetKey {
  color: number
  rank: number
  count: number
  /** ISO time the service last replaced the set. */
  updated: string
}

export interface SetDetail extends SetKey {
  color: number
  rank: number
  updated: string
  noteIds: string[]
}

export interface SetFilter {
  source?: string
  grouping?: string
}

export interface Store {
  upsertNotes: (notes: NoteInput[]) => void
  /** marks a note deleted; it stays in the cache and a later upsert of the same id restores it. */
  deleteNote: (id: string) => void
  listNotes: (fields: string[], includeDeleted?: boolean) => NoteInput[]
  getNote: (id: string) => Fields | null
  replaceSet: (key: SetKey, set: SetInput) => void
  listSets: (filter?: SetFilter) => SetSummary[]
  getSet: (key: SetKey) => SetDetail | null
  deleteSet: (key: SetKey) => void
  close: () => void
}

interface FieldRow {
  note_id: string
  field: string
  value: string
}

export function createStore(path: string): Store {
  const db = new DatabaseSync(path)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS note_fields (
      note_id TEXT NOT NULL,
      field TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (note_id, field)
    ) WITHOUT ROWID
  `)

  // sets used to be keyed by one string and tag colours had their own table: start over, the
  // sets are rebuilt by the next sync.
  const setColumns = db.prepare('PRAGMA table_info(sets)').all() as unknown as { name: string }[]
  if (setColumns.length > 0 && !setColumns.some((column) => column.name === 'source')) {
    db.exec('DROP TABLE sets')
    db.exec('DROP TABLE IF EXISTS set_notes')
  }
  db.exec('DROP TABLE IF EXISTS tag_colors')

  db.exec(`
    CREATE TABLE IF NOT EXISTS sets (
      source TEXT NOT NULL,
      grouping TEXT NOT NULL,
      set_id TEXT NOT NULL,
      color INTEGER NOT NULL,
      rank INTEGER NOT NULL,
      updated TEXT NOT NULL,
      PRIMARY KEY (source, grouping, set_id)
    ) WITHOUT ROWID
  `)
  db.exec(`
    CREATE TABLE IF NOT EXISTS set_notes (
      source TEXT NOT NULL,
      grouping TEXT NOT NULL,
      set_id TEXT NOT NULL,
      note_id TEXT NOT NULL,
      PRIMARY KEY (source, grouping, set_id, note_id)
    ) WITHOUT ROWID
  `)

  const upsert = db.prepare(
    `INSERT INTO note_fields (note_id, field, value) VALUES (?, ?, ?)
     ON CONFLICT (note_id, field) DO UPDATE SET value = excluded.value`,
  )
  const removeField = db.prepare('DELETE FROM note_fields WHERE note_id = ? AND field = ?')
  const selectAll = db.prepare(
    'SELECT note_id, field, value FROM note_fields ORDER BY note_id, field',
  )
  const selectOne = db.prepare('SELECT field, value FROM note_fields WHERE note_id = ?')

  const upsertSet = db.prepare(
    `INSERT INTO sets (source, grouping, set_id, color, rank, updated) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (source, grouping, set_id)
     DO UPDATE SET color = excluded.color, rank = excluded.rank, updated = excluded.updated`,
  )
  const clearSet = db.prepare(
    'DELETE FROM set_notes WHERE source = ? AND grouping = ? AND set_id = ?',
  )
  const addToSet = db.prepare(
    'INSERT OR IGNORE INTO set_notes (source, grouping, set_id, note_id) VALUES (?, ?, ?, ?)',
  )
  const selectSets = db.prepare(
    `SELECT sets.source AS source, sets.grouping AS grouping, sets.set_id AS id,
            sets.color AS color, sets.rank AS rank, sets.updated AS updated,
            COUNT(set_notes.note_id) AS count
     FROM sets LEFT JOIN set_notes
       ON set_notes.source = sets.source AND set_notes.grouping = sets.grouping
      AND set_notes.set_id = sets.set_id
     WHERE (? IS NULL OR sets.source = ?) AND (? IS NULL OR sets.grouping = ?)
     GROUP BY sets.source, sets.grouping, sets.set_id
     ORDER BY sets.source, sets.grouping, sets.rank, sets.set_id`,
  )
  const selectSet = db.prepare(
    'SELECT color, rank, updated FROM sets WHERE source = ? AND grouping = ? AND set_id = ?',
  )
  const selectSetNotes = db.prepare(
    `SELECT note_id FROM set_notes WHERE source = ? AND grouping = ? AND set_id = ?
     ORDER BY note_id`,
  )
  const removeSet = db.prepare('DELETE FROM sets WHERE source = ? AND grouping = ? AND set_id = ?')

  return {
    upsertNotes(notes) {
      const syncedAt = new Date().toISOString()
      db.exec('BEGIN')
      try {
        for (const { id, fields } of notes) {
          for (const [field, value] of Object.entries(fields)) {
            if (field !== SYNCED_FIELD && field !== DELETED_FIELD) upsert.run(id, field, value)
          }
          upsert.run(id, SYNCED_FIELD, syncedAt)
          removeField.run(id, DELETED_FIELD)
        }
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },

    deleteNote(id) {
      const rows = selectOne.all(id) as unknown as { field: string }[]
      if (rows.length === 0 || rows.some((row) => row.field === DELETED_FIELD)) return
      upsert.run(id, DELETED_FIELD, new Date().toISOString())
    },

    listNotes(fields, includeDeleted = false) {
      const wanted = new Set(fields)
      const rows = selectAll.all() as unknown as FieldRow[]
      const deleted = new Set(
        rows.filter((row) => row.field === DELETED_FIELD).map((r) => r.note_id),
      )
      const notes = new Map<string, Fields>()
      for (const row of rows) {
        if (!wanted.has(row.field)) continue
        if (!includeDeleted && deleted.has(row.note_id)) continue
        const note = notes.get(row.note_id) ?? {}
        note[row.field] = row.value
        notes.set(row.note_id, note)
      }
      return [...notes].map(([id, fields]) => ({ id, fields }))
    },

    getNote(id) {
      const rows = selectOne.all(id) as unknown as Omit<FieldRow, 'note_id'>[]
      if (rows.length === 0 || rows.some((row) => row.field === DELETED_FIELD)) return null
      return Object.fromEntries(rows.map((row) => [row.field, row.value]))
    },

    replaceSet({ source, grouping, id }, { color, rank, noteIds }) {
      db.exec('BEGIN')
      try {
        upsertSet.run(source, grouping, id, color, rank, new Date().toISOString())
        clearSet.run(source, grouping, id)
        for (const noteId of noteIds) addToSet.run(source, grouping, id, noteId)
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },

    listSets(filter = {}) {
      const source = filter.source ?? null
      const grouping = filter.grouping ?? null
      const rows = selectSets.all(source, source, grouping, grouping) as unknown as SetSummary[]
      return rows.map((row) => ({
        source: row.source,
        grouping: row.grouping,
        id: row.id,
        color: Number(row.color),
        rank: Number(row.rank),
        count: Number(row.count),
        updated: row.updated,
      }))
    },

    getSet({ source, grouping, id }) {
      const row = selectSet.get(source, grouping, id) as unknown as
        { color: number; rank: number; updated: string } | undefined
      if (!row) return null
      const noteIds = (
        selectSetNotes.all(source, grouping, id) as unknown as { note_id: string }[]
      ).map((r) => r.note_id)
      return {
        source,
        grouping,
        id,
        color: Number(row.color),
        rank: Number(row.rank),
        updated: row.updated,
        noteIds,
      }
    },

    deleteSet({ source, grouping, id }) {
      db.exec('BEGIN')
      try {
        removeSet.run(source, grouping, id)
        clearSet.run(source, grouping, id)
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },

    close() {
      db.close()
    },
  }
}
