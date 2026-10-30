import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createStore, type Store } from '../src/store.ts'

const key = (id: string, grouping = 'tags', source = 'bear') => ({ source, grouping, id })

describe('store', () => {
  let store: Store

  beforeEach(() => {
    store = createStore(':memory:')
  })

  afterEach(() => {
    store.close()
    vi.useRealTimers()
  })

  it('stores and returns all fields of a note', () => {
    store.upsertNotes([{ id: 'abc123', fields: { title: 'plan', body: 'raised beds' } }])
    expect(store.getNote('abc123')).toMatchObject({ title: 'plan', body: 'raised beds' })
  })

  it('returns null for an unknown note', () => {
    expect(store.getNote('nope')).toBeNull()
  })

  it('merges fields on upsert and leaves other fields alone', () => {
    store.upsertNotes([{ id: 'a', fields: { title: 'one', body: 'text' } }])
    store.upsertNotes([{ id: 'a', fields: { title: 'two' } }])
    expect(store.getNote('a')).toMatchObject({ title: 'two', body: 'text' })
  })

  it('stamps synced on insert and update', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-16T10:00:00.000Z'))
    store.upsertNotes([{ id: 'a', fields: { title: 'one' } }])
    expect(store.getNote('a')?.synced).toBe('2026-10-16T10:00:00.000Z')

    vi.setSystemTime(new Date('2026-10-17T11:30:00.000Z'))
    store.upsertNotes([{ id: 'a', fields: { title: 'two' } }])
    expect(store.getNote('a')?.synced).toBe('2026-10-17T11:30:00.000Z')
  })

  it('overrides a client-sent synced value', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-16T10:00:00.000Z'))
    store.upsertNotes([{ id: 'a', fields: { synced: 'yesterday' } }])
    expect(store.getNote('a')?.synced).toBe('2026-10-16T10:00:00.000Z')
  })

  it('uses one timestamp for a whole batch', () => {
    store.upsertNotes([
      { id: 'a', fields: { title: 'one' } },
      { id: 'b', fields: { title: 'two' } },
    ])
    expect(store.getNote('a')?.synced).toBe(store.getNote('b')?.synced)
  })

  it('lists only the requested fields, one item per note', () => {
    store.upsertNotes([
      { id: 'a', fields: { title: 'plan', body: 'long text' } },
      { id: 'b', fields: { title: 'plants', body: 'more text' } },
    ])
    expect(store.listNotes(['title'])).toEqual([
      { id: 'a', fields: { title: 'plan' } },
      { id: 'b', fields: { title: 'plants' } },
    ])
  })

  it('omits notes that have none of the requested fields and ignores unknown fields', () => {
    store.upsertNotes([
      { id: 'a', fields: { title: 'plan' } },
      { id: 'b', fields: { body: 'only body' } },
    ])
    expect(store.listNotes(['title', 'missing'])).toEqual([{ id: 'a', fields: { title: 'plan' } }])
  })

  describe('deleting notes', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-10-16T10:00:00.000Z'))
      store.upsertNotes([
        { id: 'a', fields: { title: 'one' } },
        { id: 'b', fields: { title: 'two' } },
      ])
    })

    it('marks a note deleted and hides it from normal retrieval', () => {
      vi.setSystemTime(new Date('2026-10-17T08:00:00.000Z'))
      store.deleteNote('a')
      expect(store.getNote('a')).toBeNull()
      expect(store.getNote('b')).not.toBeNull()
      expect(store.listNotes(['title'])).toEqual([{ id: 'b', fields: { title: 'two' } }])
    })

    it('lists deleted notes, with their deleted time, when asked to include them', () => {
      vi.setSystemTime(new Date('2026-10-17T08:00:00.000Z'))
      store.deleteNote('a')
      expect(store.listNotes(['title', 'deleted'], true)).toEqual([
        { id: 'a', fields: { title: 'one', deleted: '2026-10-17T08:00:00.000Z' } },
        { id: 'b', fields: { title: 'two' } },
      ])
    })

    it('keeps the first deleted time when a note is deleted again', () => {
      vi.setSystemTime(new Date('2026-10-17T08:00:00.000Z'))
      store.deleteNote('a')
      vi.setSystemTime(new Date('2026-10-18T08:00:00.000Z'))
      store.deleteNote('a')
      expect(store.listNotes(['deleted'], true)[0]?.fields.deleted).toBe('2026-10-17T08:00:00.000Z')
    })

    it('restores a deleted note when the same id is pushed again', () => {
      store.deleteNote('a')
      store.upsertNotes([{ id: 'a', fields: { title: 'back' } }])
      expect(store.getNote('a')).toMatchObject({ title: 'back' })
      expect(store.getNote('a')).not.toHaveProperty('deleted')
    })

    it('ignores a client-sent deleted value', () => {
      store.upsertNotes([{ id: 'a', fields: { deleted: 'yes' } }])
      expect(store.getNote('a')).not.toHaveProperty('deleted')
    })

    it('does not touch the sets a deleted note is in', () => {
      store.replaceSet(key('s'), { color: 0, rank: 0, noteIds: ['a'] })
      store.deleteNote('a')
      expect(store.getSet(key('s'))?.noteIds).toEqual(['a'])
    })
  })

  it('lists notes ordered by id, keeping digit-only ids in place', () => {
    store.upsertNotes([
      { id: 'b', fields: { title: 'x' } },
      { id: '9', fields: { title: 'x' } },
      { id: 'a', fields: { title: 'x' } },
    ])
    expect(store.listNotes(['title']).map((note) => note.id)).toEqual(['9', 'a', 'b'])
  })

  it('treats deleting an unknown note as a no-op', () => {
    expect(() => {
      store.deleteNote('nope')
    }).not.toThrow()
  })

  it('rolls back the whole batch when a note cannot be stored', () => {
    const batch = [
      { id: 'good', fields: { title: 'x' } },
      { id: 'bad', fields: { title: undefined as unknown as string } },
    ]

    expect(() => store.upsertNotes(batch)).toThrow()
    expect(store.getNote('good')).toBeNull()
  })

  describe('sets', () => {
    it('stores a set with its colour, rank and note ids ordered and counted', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-10-27T09:00:00.000Z'))
      store.replaceSet(key('daily'), { color: 5, rank: 2, noteIds: ['b', 'a', 'a'] })
      expect(store.getSet(key('daily'))).toEqual({
        ...key('daily'),
        color: 5,
        rank: 2,
        updated: '2026-10-27T09:00:00.000Z',
        noteIds: ['a', 'b'],
      })
      expect(store.listSets()).toEqual([
        {
          ...key('daily'),
          color: 5,
          rank: 2,
          count: 2,
          updated: '2026-10-27T09:00:00.000Z',
        },
      ])
    })

    it('replaces the members, colour and rank and refreshes updated', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-10-27T09:00:00.000Z'))
      store.replaceSet(key('s'), { color: 1, rank: 0, noteIds: ['a', 'b'] })
      vi.setSystemTime(new Date('2026-10-27T10:00:00.000Z'))
      store.replaceSet(key('s'), { color: 2, rank: 3, noteIds: ['c'] })
      expect(store.getSet(key('s'))).toEqual({
        ...key('s'),
        color: 2,
        rank: 3,
        updated: '2026-10-27T10:00:00.000Z',
        noteIds: ['c'],
      })
    })

    it('keeps an empty set', () => {
      store.replaceSet(key('s'), { color: 0, rank: 0, noteIds: [] })
      expect(store.getSet(key('s'))?.noteIds).toEqual([])
      expect(store.listSets()).toMatchObject([{ id: 's', count: 0 }])
    })

    it('keeps the same id apart per source and grouping', () => {
      store.replaceSet(key('x', 'tags', 'bear'), { color: 1, rank: 0, noteIds: ['a'] })
      store.replaceSet(key('x', 'tags', 'file'), { color: 2, rank: 0, noteIds: ['b'] })
      store.replaceSet(key('x', 'sync', 'bear'), { color: 3, rank: 0, noteIds: ['c'] })
      expect(store.getSet(key('x', 'tags', 'bear'))?.noteIds).toEqual(['a'])
      expect(store.getSet(key('x', 'tags', 'file'))?.noteIds).toEqual(['b'])
      expect(store.getSet(key('x', 'sync', 'bear'))?.noteIds).toEqual(['c'])
    })

    it('keeps ids with slashes and colons as they are written', () => {
      store.replaceSet(key('work/q4:x'), { color: 0, rank: 0, noteIds: [] })
      expect(store.getSet(key('work/q4:x'))).not.toBeNull()
    })

    it('lists sets ordered by source, grouping, rank and id, and filters them', () => {
      store.replaceSet(key('b', 'tags'), { color: 0, rank: 0, noteIds: ['1'] })
      store.replaceSet(key('a', 'tags'), { color: 0, rank: 0, noteIds: [] })
      store.replaceSet(key('z', 'sync'), { color: 0, rank: 0, noteIds: [] })
      store.replaceSet(key('y', 'sync'), { color: 0, rank: 1, noteIds: [] })
      store.replaceSet(key('a', 'tags', 'file'), { color: 0, rank: 0, noteIds: [] })
      const ids = (sets: { source: string; grouping: string; id: string }[]) =>
        sets.map((set) => `${set.source}:${set.grouping}:${set.id}`)

      expect(ids(store.listSets())).toEqual([
        'bear:sync:z',
        'bear:sync:y',
        'bear:tags:a',
        'bear:tags:b',
        'file:tags:a',
      ])
      expect(ids(store.listSets({ source: 'bear', grouping: 'tags' }))).toEqual([
        'bear:tags:a',
        'bear:tags:b',
      ])
      expect(ids(store.listSets({ grouping: 'sync' }))).toEqual(['bear:sync:z', 'bear:sync:y'])
      expect(ids(store.listSets({ source: 'file' }))).toEqual(['file:tags:a'])
    })

    it('returns null for an unknown set', () => {
      expect(store.getSet(key('nope'))).toBeNull()
    })

    it('deletes a set and its members, even an unknown one', () => {
      store.replaceSet(key('s'), { color: 0, rank: 0, noteIds: ['a'] })
      store.deleteSet(key('s'))
      store.deleteSet(key('s'))
      expect(store.getSet(key('s'))).toBeNull()
      expect(store.listSets()).toEqual([])
    })
  })

  describe('opening a database with the old layout', () => {
    it('drops the old sets and tag colours and starts clean', () => {
      const dir = mkdtempSync(join(tmpdir(), 'cache-'))
      const path = join(dir, 'old.db')
      const old = new DatabaseSync(path)
      old.exec('CREATE TABLE sets (set_id TEXT PRIMARY KEY, updated TEXT NOT NULL)')
      old.exec('CREATE TABLE set_notes (set_id TEXT NOT NULL, note_id TEXT NOT NULL)')
      old.exec('CREATE TABLE tag_colors (tag TEXT PRIMARY KEY, color INTEGER NOT NULL)')
      old.exec("INSERT INTO sets VALUES ('bear:created-today', 'x')")
      old.close()

      const migrated = createStore(path)
      try {
        expect(migrated.listSets()).toEqual([])
        migrated.replaceSet(key('s'), { color: 0, rank: 0, noteIds: [] })
        expect(migrated.listSets()).toHaveLength(1)
      } finally {
        migrated.close()
        rmSync(dir, { recursive: true })
      }
    })
  })
})
