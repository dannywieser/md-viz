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
})
