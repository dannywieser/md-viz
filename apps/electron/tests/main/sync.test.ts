// @vitest-environment node
import type { Note } from '../../src/main/notes'
import { syncNotes } from '../../src/main/sync'
import type { SyncProgress } from '../../src/shared/ipc'

/** a minimal in-memory stand-in for the cache service's notes routes. */
function fakeCache() {
  const notes = new Map<string, Record<string, string>>()
  const upserts: number[] = []
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

  const handler = async (input: Request | URL | string, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init)
    const url = new URL(request.url)
    if (request.method === 'GET' && url.pathname === '/notes') {
      const wanted = (url.searchParams.get('fields') ?? '').split(',')
      return json(
        [...notes].map(([id, fields]) => ({
          id,
          fields: Object.fromEntries(
            Object.entries(fields).filter(([name]) => wanted.includes(name)),
          ),
        })),
      )
    }
    if (request.method === 'PUT' && url.pathname === '/notes') {
      const body = (await request.json()) as {
        notes: { id: string; fields: Record<string, string> }[]
      }
      upserts.push(body.notes.length)
      for (const note of body.notes) {
        notes.set(note.id, {
          ...notes.get(note.id),
          ...note.fields,
          synced: new Date().toISOString(),
        })
      }
      return json({ upserted: body.notes.length })
    }
    if (request.method === 'DELETE' && url.pathname.startsWith('/notes/')) {
      notes.delete(decodeURIComponent(url.pathname.slice('/notes/'.length)))
      return new Response(null, { status: 204 })
    }
    return json({ error: 'not found' }, 404)
  }
  return { notes, upserts, fetch: handler }
}

const PAST = '2020-01-01T00:00:00.000Z'
const FUTURE = new Date(Date.now() + 60_000).toISOString()

const note = (id: string, overrides: Partial<Note> = {}): Note => ({
  id,
  source: 'file',
  title: id,
  body: `body of ${id}`,
  tags: [],
  created: '',
  modified: PAST,
  ...overrides,
})

const loaded = (...notes: Note[]) => ({ notes, failed: [] })

describe('syncNotes', () => {
  it('pushes every note on the first sync with all its fields', async () => {
    const cache = fakeCache()

    const result = await syncNotes(
      'bear',
      loaded(
        note('a', { source: 'bear', tags: ['x', 'x/y'], created: PAST }),
        note('b', { source: 'bear' }),
      ),
      { fetch: cache.fetch },
    )

    expect(result).toEqual({
      scanned: 2,
      synced: 2,
      unchanged: 0,
      deleted: 0,
      failed: 0,
      notes: {
        updated: [
          { id: 'a', title: 'a' },
          { id: 'b', title: 'b' },
        ],
        deleted: [],
        unchanged: [],
      },
    })
    expect(cache.notes.get('a')).toMatchObject({
      title: 'a',
      body: 'body of a',
      tags: '["x","x/y"]',
      created: PAST,
      modified: PAST,
      source: 'bear',
    })
  })

  it('skips unchanged notes and pushes only the ones modified after the last sync', async () => {
    const cache = fakeCache()
    await syncNotes('file', loaded(note('a'), note('b')), { fetch: cache.fetch })

    const result = await syncNotes(
      'file',
      loaded(note('a'), note('b', { body: 'edited', modified: FUTURE })),
      { fetch: cache.fetch },
    )

    expect(result).toMatchObject({ synced: 1, unchanged: 1, deleted: 0 })
    expect(result.notes.updated).toEqual([{ id: 'b', title: 'b' }])
    expect(result.notes.unchanged).toEqual([{ id: 'a', title: 'a' }])
    expect(cache.notes.get('b')?.['body']).toBe('edited')
  })

  it('deletes cached notes of the source that are gone from it', async () => {
    const cache = fakeCache()
    await syncNotes('file', loaded(note('a'), note('b')), { fetch: cache.fetch })

    const result = await syncNotes('file', loaded(note('a')), { fetch: cache.fetch })

    expect(result).toMatchObject({ synced: 0, unchanged: 1, deleted: 1 })
    expect(result.notes.deleted).toEqual([{ id: 'b', title: 'b' }])
    expect([...cache.notes.keys()]).toEqual(['a'])
  })

  it('never deletes the notes of another source, in either direction', async () => {
    const cache = fakeCache()
    await syncNotes('file', loaded(note('f')), { fetch: cache.fetch })
    await syncNotes('bear', loaded(note('b', { source: 'bear' })), { fetch: cache.fetch })

    const bearEmpty = await syncNotes('bear', loaded(), { fetch: cache.fetch })
    expect(bearEmpty.notes.deleted).toEqual([{ id: 'b', title: 'b' }])
    expect([...cache.notes.keys()]).toEqual(['f'])

    await syncNotes('bear', loaded(note('b', { source: 'bear' })), { fetch: cache.fetch })
    const fileEmpty = await syncNotes('file', loaded(), { fetch: cache.fetch })
    expect(fileEmpty.notes.deleted).toEqual([{ id: 'f', title: 'f' }])
    expect([...cache.notes.keys()]).toEqual(['b'])
  })

  it('leaves cached notes with no source alone', async () => {
    const cache = fakeCache()
    cache.notes.set('legacy', { title: 'legacy' })

    const result = await syncNotes('file', loaded(note('a')), { fetch: cache.fetch })

    expect(result.deleted).toBe(0)
    expect(cache.notes.has('legacy')).toBe(true)
  })

  it('upserts in batches of 200 and reports progress', async () => {
    const cache = fakeCache()
    const updates: SyncProgress[] = []

    const result = await syncNotes(
      'file',
      loaded(...Array.from({ length: 450 }, (_, i) => note(`n${i}`))),
      { fetch: cache.fetch, onProgress: (p) => updates.push(p) },
    )

    expect(result.synced).toBe(450)
    expect(cache.upserts).toEqual([200, 200, 50])
    expect(updates[0]).toEqual({ synced: 0, deleted: 0, total: 450 })
    expect(updates.at(-1)).toEqual({ synced: 450, deleted: 0, total: 450 })
  })

  it('deletes in groups and counts them in the progress', async () => {
    const cache = fakeCache()
    const many = Array.from({ length: 45 }, (_, i) => note(`n${i}`))
    await syncNotes('file', loaded(...many), { fetch: cache.fetch })
    const updates: SyncProgress[] = []

    const result = await syncNotes('file', loaded(), {
      fetch: cache.fetch,
      onProgress: (p) => updates.push(p),
    })

    expect(result.deleted).toBe(45)
    expect(cache.notes.size).toBe(0)
    expect(updates.at(-1)).toEqual({ synced: 0, deleted: 45, total: 45 })
  })

  it('deletes nothing when the cache cannot be listed', async () => {
    const cache = fakeCache()
    await syncNotes('file', loaded(note('a')), { fetch: cache.fetch })
    const failing = (() => Promise.resolve(new Response('boom', { status: 500 }))) as typeof fetch

    await expect(syncNotes('file', loaded(), { fetch: failing })).rejects.toBeDefined()
    expect(cache.notes.size).toBe(1)
  })

  it('counts notes that could not be read as failed and keeps them in the cache', async () => {
    const cache = fakeCache()
    await syncNotes('file', loaded(note('a'), note('b')), { fetch: cache.fetch })

    const result = await syncNotes(
      'file',
      { notes: [note('a')], failed: ['b'] },
      { fetch: cache.fetch },
    )

    expect(result).toMatchObject({ scanned: 2, synced: 0, unchanged: 1, deleted: 0, failed: 1 })
    expect(cache.notes.has('b')).toBe(true)
  })

  it('does not call the cache for upserts when nothing changed', async () => {
    const cache = fakeCache()

    const result = await syncNotes('file', loaded(), { fetch: cache.fetch })

    expect(result).toMatchObject({ scanned: 0, synced: 0 })
    expect(cache.upserts).toEqual([])
  })

  it('treats cached notes without a title or sync time as stale, titling deletions by id', async () => {
    const cache = fakeCache()
    cache.notes.set('a', { source: 'file' })
    cache.notes.set('orphan', { source: 'file' })

    const result = await syncNotes('file', loaded(note('a')), { fetch: cache.fetch })

    expect(result.synced).toBe(1)
    expect(result.notes.deleted).toEqual([{ id: 'orphan', title: 'orphan' }])
  })

  it('syncs to the cache named by baseUrl', async () => {
    const urls: string[] = []
    const spy = ((input: Request | URL | string, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init)
      urls.push(request.url)
      return Promise.resolve(
        new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } }),
      )
    }) as typeof fetch

    await syncNotes('file', loaded(), { baseUrl: 'http://cache.test', fetch: spy })

    expect(urls[0]).toMatch(/^http:\/\/cache\.test\/notes/)
  })
})
