import { DatabaseSync } from 'node:sqlite'

/** Field the service writes itself on every upsert; client values for it are overwritten. */
export const SYNCED_FIELD = 'synced'

export type Fields = Record<string, string>

export interface NoteInput {
  id: string
  fields: Fields
}

export interface SetSummary {
  id: string
  count: number
  /** ISO time the service last replaced the set. */
  updated: string
}

export interface SetDetail {
  id: string
  updated: string
  noteIds: string[]
}

export interface TagColor {
  tag: string
  /** index into the note palette; the cache does not interpret it. */
  color: number
}

export interface Store {
  upsertNotes: (notes: NoteInput[]) => void
  deleteNote: (id: string) => void
  listNotes: (fields: string[]) => NoteInput[]
  getNote: (id: string) => Fields | null
  replaceSet: (id: string, noteIds: string[]) => void
  listSets: () => SetSummary[]
  getSet: (id: string) => SetDetail | null
  deleteSet: (id: string) => void
  addTagColors: (rows: TagColor[]) => number
  listTagColors: () => TagColor[]
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

  db.exec(`
    CREATE TABLE IF NOT EXISTS sets (
      set_id TEXT PRIMARY KEY,
      updated TEXT NOT NULL
    ) WITHOUT ROWID
  `)
  db.exec(`
    CREATE TABLE IF NOT EXISTS set_notes (
      set_id TEXT NOT NULL,
      note_id TEXT NOT NULL,
      PRIMARY KEY (set_id, note_id)
    ) WITHOUT ROWID
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS tag_colors (
      tag TEXT PRIMARY KEY,
      color INTEGER NOT NULL
    ) WITHOUT ROWID
  `)

  const upsert = db.prepare(
    `INSERT INTO note_fields (note_id, field, value) VALUES (?, ?, ?)
     ON CONFLICT (note_id, field) DO UPDATE SET value = excluded.value`,
  )
  const remove = db.prepare('DELETE FROM note_fields WHERE note_id = ?')
  const selectAll = db.prepare(
    'SELECT note_id, field, value FROM note_fields ORDER BY note_id, field',
  )
  const selectOne = db.prepare('SELECT field, value FROM note_fields WHERE note_id = ?')

  const removeFromSets = db.prepare('DELETE FROM set_notes WHERE note_id = ?')
  const upsertSet = db.prepare(
    `INSERT INTO sets (set_id, updated) VALUES (?, ?)
     ON CONFLICT (set_id) DO UPDATE SET updated = excluded.updated`,
  )
  const clearSet = db.prepare('DELETE FROM set_notes WHERE set_id = ?')
  const addToSet = db.prepare('INSERT OR IGNORE INTO set_notes (set_id, note_id) VALUES (?, ?)')
  const selectSets = db.prepare(
    `SELECT sets.set_id AS id, sets.updated AS updated, COUNT(set_notes.note_id) AS count
     FROM sets LEFT JOIN set_notes ON set_notes.set_id = sets.set_id
     GROUP BY sets.set_id ORDER BY sets.set_id`,
  )
  const selectSet = db.prepare('SELECT updated FROM sets WHERE set_id = ?')
  const selectSetNotes = db.prepare(
    'SELECT note_id FROM set_notes WHERE set_id = ? ORDER BY note_id',
  )
  const removeSet = db.prepare('DELETE FROM sets WHERE set_id = ?')

  const addTagColor = db.prepare('INSERT OR IGNORE INTO tag_colors (tag, color) VALUES (?, ?)')
  const selectTagColors = db.prepare('SELECT tag, color FROM tag_colors ORDER BY tag')

  return {
    upsertNotes(notes) {
      const syncedAt = new Date().toISOString()
      db.exec('BEGIN')
      try {
        for (const { id, fields } of notes) {
          for (const [field, value] of Object.entries(fields)) {
            if (field !== SYNCED_FIELD) upsert.run(id, field, value)
          }
          upsert.run(id, SYNCED_FIELD, syncedAt)
        }
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },

    deleteNote(id) {
      db.exec('BEGIN')
      try {
        remove.run(id)
        removeFromSets.run(id)
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },

    listNotes(fields) {
      const wanted = new Set(fields)
      const notes = new Map<string, Fields>()
      for (const row of selectAll.all() as unknown as FieldRow[]) {
        if (!wanted.has(row.field)) continue
        const note = notes.get(row.note_id) ?? {}
        note[row.field] = row.value
        notes.set(row.note_id, note)
      }
      return [...notes].map(([id, fields]) => ({ id, fields }))
    },

    getNote(id) {
      const rows = selectOne.all(id) as unknown as Omit<FieldRow, 'note_id'>[]
      if (rows.length === 0) return null
      return Object.fromEntries(rows.map((row) => [row.field, row.value]))
    },

    replaceSet(id, noteIds) {
      db.exec('BEGIN')
      try {
        upsertSet.run(id, new Date().toISOString())
        clearSet.run(id)
        for (const noteId of noteIds) addToSet.run(id, noteId)
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },

    listSets() {
      return (selectSets.all() as unknown as SetSummary[]).map(({ id, count, updated }) => ({
        id,
        count: Number(count),
        updated,
      }))
    },

    getSet(id) {
      const row = selectSet.get(id) as unknown as { updated: string } | undefined
      if (!row) return null
      const noteIds = (selectSetNotes.all(id) as unknown as { note_id: string }[]).map(
        (r) => r.note_id,
      )
      return { id, updated: row.updated, noteIds }
    },

    deleteSet(id) {
      db.exec('BEGIN')
      try {
        removeSet.run(id)
        clearSet.run(id)
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },

    addTagColors(rows) {
      let added = 0
      db.exec('BEGIN')
      try {
        for (const { tag, color } of rows) added += Number(addTagColor.run(tag, color).changes)
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
      return added
    },

    listTagColors() {
      return (selectTagColors.all() as unknown as TagColor[]).map(({ tag, color }) => ({
        tag,
        color: Number(color),
      }))
    },

    close() {
      db.close()
    },
  }
}
