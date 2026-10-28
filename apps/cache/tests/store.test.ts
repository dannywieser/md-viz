import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createStore, type Store } from '../src/store.ts'

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

  it('deletes a note with all its fields', () => {
    store.upsertNotes([
      { id: 'a', fields: { title: 'one' } },
      { id: 'b', fields: { title: 'two' } },
    ])
    store.deleteNote('a')
    expect(store.getNote('a')).toBeNull()
    expect(store.getNote('b')).not.toBeNull()
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
    it('stores a set with its note ids ordered and counted', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-10-27T09:00:00.000Z'))
      store.replaceSet('bear:created-today', ['b', 'a', 'a'])
      expect(store.getSet('bear:created-today')).toEqual({
        id: 'bear:created-today',
        updated: '2026-10-27T09:00:00.000Z',
        noteIds: ['a', 'b'],
      })
      expect(store.listSets()).toEqual([
        { id: 'bear:created-today', count: 2, updated: '2026-10-27T09:00:00.000Z' },
      ])
    })

    it('replaces the members and refreshes updated', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-10-27T09:00:00.000Z'))
      store.replaceSet('s', ['a', 'b'])
      vi.setSystemTime(new Date('2026-10-27T10:00:00.000Z'))
      store.replaceSet('s', ['c'])
      expect(store.getSet('s')).toEqual({
        id: 's',
        updated: '2026-10-27T10:00:00.000Z',
        noteIds: ['c'],
      })
    })

    it('keeps an empty set', () => {
      store.replaceSet('s', [])
      expect(store.getSet('s')?.noteIds).toEqual([])
      expect(store.listSets()).toMatchObject([{ id: 's', count: 0 }])
    })

    it('lists sets ordered by id', () => {
      store.replaceSet('b', ['1'])
      store.replaceSet('a', [])
      expect(store.listSets().map((set) => set.id)).toEqual(['a', 'b'])
    })

    it('returns null for an unknown set', () => {
      expect(store.getSet('nope')).toBeNull()
    })

    it('deletes a set and its members, even an unknown one', () => {
      store.replaceSet('s', ['a'])
      store.deleteSet('s')
      store.deleteSet('s')
      expect(store.getSet('s')).toBeNull()
      expect(store.listSets()).toEqual([])
    })

    it('removes a deleted note from every set', () => {
      store.upsertNotes([{ id: 'a', fields: { title: 'one' } }])
      store.replaceSet('s1', ['a', 'b'])
      store.replaceSet('s2', ['a'])
      store.deleteNote('a')
      expect(store.getSet('s1')?.noteIds).toEqual(['b'])
      expect(store.getSet('s2')?.noteIds).toEqual([])
    })
  })

  describe('tag colors', () => {
    it('starts with no colors', () => {
      expect(store.listTagColors()).toEqual([])
    })

    it('stores the color of each tag, ordered by tag, and counts what it added', () => {
      const added = store.addTagColors([
        { tag: 'work', color: 3 },
        { tag: 'home', color: 7 },
      ])

      expect(added).toBe(2)
      expect(store.listTagColors()).toEqual([
        { tag: 'home', color: 7 },
        { tag: 'work', color: 3 },
      ])
    })

    it('keeps the color a tag already has', () => {
      store.addTagColors([{ tag: 'work', color: 3 }])

      const added = store.addTagColors([
        { tag: 'work', color: 9 },
        { tag: 'new', color: 1 },
      ])

      expect(added).toBe(1)
      expect(store.listTagColors()).toEqual([
        { tag: 'new', color: 1 },
        { tag: 'work', color: 3 },
      ])
    })

    it('keeps tags with slashes as they are written', () => {
      store.addTagColors([{ tag: 'work/q4', color: 2 }])

      expect(store.listTagColors()).toEqual([{ tag: 'work/q4', color: 2 }])
    })

    it('rolls back the whole batch when a row cannot be stored', () => {
      const rows = [
        { tag: 'good', color: 1 },
        { tag: 'bad', color: undefined as unknown as number },
      ]

      expect(() => store.addTagColors(rows)).toThrow()
      expect(store.listTagColors()).toEqual([])
    })
  })
})
