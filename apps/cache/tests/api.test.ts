import type { OpenAPIHono } from '@hono/zod-openapi'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app.ts'
import { createStore, type Store } from '../src/store.ts'

describe('api', () => {
  let store: Store
  let app: OpenAPIHono

  beforeEach(() => {
    store = createStore(':memory:')
    app = createApp(store)
  })

  afterEach(() => {
    store.close()
  })

  const put = (body: unknown) =>
    app.request('/notes', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })

  const garden = {
    notes: [
      { id: 'abc123', fields: { title: 'plan', body: 'raised beds' } },
      { id: 'def456', fields: { title: 'plants', body: 'tomatoes' } },
    ],
  }

  it('reports health', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('upserts notes and reports the count', async () => {
    const res = await put(garden)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ upserted: 2 })
  })

  it('lists only requested fields as an array ordered by id', async () => {
    await put(garden)
    const res = await app.request('/notes?fields=title')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([
      { id: 'abc123', fields: { title: 'plan' } },
      { id: 'def456', fields: { title: 'plants' } },
    ])
  })

  it('includes the server-stamped synced field', async () => {
    await put({ notes: [{ id: 'a', fields: { title: 'one', synced: 'client' } }] })
    const res = await app.request('/notes?fields=synced')
    const [note] = (await res.json()) as { id: string; fields: { synced: string } }[]
    expect(note.id).toBe('a')
    expect(new Date(note.fields.synced).toISOString()).toBe(note.fields.synced)
    expect(note.fields.synced).not.toBe('client')
  })

  it('requires fields on the list endpoint', async () => {
    expect((await app.request('/notes')).status).toBe(400)
    expect((await app.request('/notes?fields=')).status).toBe(400)
    expect((await app.request('/notes?fields=,')).status).toBe(400)
  })

  it('returns all fields of one note', async () => {
    await put(garden)
    const res = await app.request('/notes/abc123')
    expect(res.status).toBe(200)
    const body = (await res.json()) as { fields: Record<string, string> }
    expect(body.fields).toMatchObject({ title: 'plan', body: 'raised beds' })
  })

  it('returns 404 for an unknown note', async () => {
    expect((await app.request('/notes/nope')).status).toBe(404)
  })

  it('merges fields over several puts', async () => {
    await put(garden)
    await put({ notes: [{ id: 'abc123', fields: { title: 'garden plan' } }] })
    const res = await app.request('/notes/abc123')
    const body = (await res.json()) as { fields: Record<string, string> }
    expect(body.fields).toMatchObject({ title: 'garden plan', body: 'raised beds' })
  })

  it('lists deleted notes only for the sync grouping', async () => {
    await put(garden)
    await app.request('/notes/abc123', { method: 'DELETE' })

    const ids = async (query: string) =>
      (
        (await (await app.request(`/notes?fields=title,deleted${query}`)).json()) as {
          id: string
        }[]
      ).map((note) => note.id)

    expect(await ids('')).toEqual(['def456'])
    expect(await ids('&grouping=tags')).toEqual(['def456'])
    expect(await ids('&grouping=sync')).toEqual(['abc123', 'def456'])
    const sync = (await (await app.request('/notes?fields=deleted&grouping=sync')).json()) as {
      fields: { deleted?: string }
    }[]
    expect(sync[0]?.fields.deleted).toBeDefined()
  })

  it('restores a deleted note when it is put again', async () => {
    await put(garden)
    await app.request('/notes/abc123', { method: 'DELETE' })
    await put({ notes: [{ id: 'abc123', fields: { title: 'back' } }] })
    expect((await app.request('/notes/abc123')).status).toBe(200)
  })

  it('deletes a note, idempotently', async () => {
    await put(garden)
    expect((await app.request('/notes/abc123', { method: 'DELETE' })).status).toBe(204)
    expect((await app.request('/notes/abc123', { method: 'DELETE' })).status).toBe(204)
    expect((await app.request('/notes/abc123')).status).toBe(404)
    expect((await app.request('/notes/def456')).status).toBe(200)
  })

  it.each([
    ['invalid json', '{nope'],
    ['missing notes', {}],
    ['notes not an array', { notes: {} }],
    ['empty id', { notes: [{ id: '', fields: {} }] }],
    ['id with slash', { notes: [{ id: 'a/b', fields: {} }] }],
    ['missing fields', { notes: [{ id: 'a' }] }],
    ['non-string value', { notes: [{ id: 'a', fields: { title: 1 } }] }],
    ['field name with slash', { notes: [{ id: 'a', fields: { 'x/y': 'v' } }] }],
  ])('rejects a bad put: %s', async (_name, body) => {
    const res = await put(body)
    expect(res.status).toBe(400)
    expect(await res.json()).toHaveProperty('error')
  })

  it('names the input when the whole body is invalid', async () => {
    const res = await put('null')

    expect(res.status).toBe(400)
    expect(((await res.json()) as { error: string }).error).toMatch(/^input: /)
  })

  it('stores nothing from a rejected batch', async () => {
    await put({
      notes: [
        { id: 'good', fields: { title: 'x' } },
        { id: 'a/b', fields: {} },
      ],
    })
    expect((await app.request('/notes/good')).status).toBe(404)
  })

  it('allows cross-origin requests', async () => {
    const res = await app.request('/health', { headers: { origin: 'http://localhost:5175' } })
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })

  it('answers 500 without leaking details when the store fails', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(store, 'listNotes').mockImplementation(() => {
      throw new Error('disk on fire')
    })

    const res = await app.request('/notes?fields=title')

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'internal error' })
    expect(log).toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  describe('sets', () => {
    const key = (id: string, grouping = 'tags', source = 'bear') => ({ source, grouping, id })
    const query = (k: { source: string; grouping: string; id: string }) =>
      `source=${encodeURIComponent(k.source)}&grouping=${encodeURIComponent(k.grouping)}&id=${encodeURIComponent(k.id)}`
    const putSet = (body: unknown) =>
      app.request('/sets', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })

    it('replaces a set and reports the count', async () => {
      const res = await putSet({ ...key('daily'), color: 4, rank: 0, noteIds: ['a', 'b', 'a'] })
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ count: 2 })
    })

    it('lists sets with counts, optionally filtered', async () => {
      await putSet({ ...key('daily'), color: 4, rank: 0, noteIds: ['a', 'b'] })
      await putSet({ ...key('today', 'sync'), color: 1, rank: 2, noteIds: [] })
      await putSet({ ...key('daily', 'tags', 'file'), color: 4, rank: 0, noteIds: [] })

      const all = (await (await app.request('/sets')).json()) as {
        source: string
        grouping: string
        id: string
      }[]
      expect(all.map((set) => `${set.source}:${set.grouping}:${set.id}`)).toEqual([
        'bear:sync:today',
        'bear:tags:daily',
        'file:tags:daily',
      ])
      expect(all[1]).toMatchObject({ color: 4, rank: 0, count: 2 })

      const filtered = (await (
        await app.request('/sets?source=bear&grouping=tags')
      ).json()) as unknown[]
      expect(filtered).toHaveLength(1)
    })

    it('returns one set with its note ids, ids with slashes included', async () => {
      await putSet({ ...key('work/q4:x'), color: 2, rank: 1, noteIds: ['b', 'a'] })
      const res = await app.request(`/set?${query(key('work/q4:x'))}`)
      expect(res.status).toBe(200)
      expect(await res.json()).toMatchObject({
        ...key('work/q4:x'),
        color: 2,
        rank: 1,
        noteIds: ['a', 'b'],
      })
    })

    it('returns 404 for an unknown set', async () => {
      expect((await app.request(`/set?${query(key('nope'))}`)).status).toBe(404)
    })

    it.each([
      ['noteIds not an array', { ...key('s'), color: 0, rank: 0, noteIds: 'a' }],
      ['an id with a slash in noteIds', { ...key('s'), color: 0, rank: 0, noteIds: ['a/b'] }],
      ['a negative color', { ...key('s'), color: -1, rank: 0, noteIds: [] }],
      ['no source', { grouping: 'tags', id: 's', color: 0, rank: 0, noteIds: [] }],
      ['an empty id', { ...key(''), color: 0, rank: 0, noteIds: [] }],
    ])('rejects a bad set: %s', async (_name, body) => {
      const res = await putSet(body)
      expect(res.status).toBe(400)
      expect(await res.json()).toHaveProperty('error')
    })

    it('needs all three key fields to read or delete a set', async () => {
      expect((await app.request('/set?source=bear&grouping=tags')).status).toBe(400)
      expect(
        (await app.request('/set?source=bear&grouping=tags', { method: 'DELETE' })).status,
      ).toBe(400)
    })

    it('deletes a set, even an unknown one', async () => {
      await putSet({ ...key('s'), color: 0, rank: 0, noteIds: ['a'] })
      const url = `/set?${query(key('s'))}`
      expect((await app.request(url, { method: 'DELETE' })).status).toBe(204)
      expect((await app.request(url, { method: 'DELETE' })).status).toBe(204)
      expect((await app.request(url)).status).toBe(404)
    })

    it('keeps a deleted note in its sets', async () => {
      await put(garden)
      await putSet({ ...key('s'), color: 0, rank: 0, noteIds: ['abc123', 'def456'] })
      await app.request('/notes/abc123', { method: 'DELETE' })
      const set = (await (await app.request(`/set?${query(key('s'))}`)).json()) as {
        noteIds: string[]
      }
      expect(set.noteIds).toEqual(['abc123', 'def456'])
    })
  })
})
