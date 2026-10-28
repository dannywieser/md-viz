// @vitest-environment node
import type { Note } from '../../src/pipeline/notes'
import { syncNotes } from '../../src/pipeline/sync'
import type { SyncProgress } from '../../src/types'

/** a minimal in-memory stand-in for the cache service's notes routes. */
function fakeCache() {
  const notes = new Map<string, Record<string, string>>()
  const upserts: number[] = []
  const sets = new Map<string, string[]>()
  const tagColors = new Map<string, number>()
  /** the writes that reached the cache, in order. */
  const writes: string[] = []
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
    if (request.method === 'GET' && url.pathname === '/tag-colors') {
      return json({ tags: [...tagColors].map(([tag, color]) => ({ tag, color })) })
    }
    if (request.method === 'POST' && url.pathname === '/tag-colors') {
      const body = (await request.json()) as { tags: { tag: string; color: number }[] }
      writes.push('tag-colors')
      let added = 0
      for (const { tag, color } of body.tags) {
        if (!tagColors.has(tag)) added++
        if (!tagColors.has(tag)) tagColors.set(tag, color)
      }
      return json({ added })
    }
    if (request.method === 'PUT' && url.pathname === '/notes') {
      const body = (await request.json()) as {
        notes: { id: string; fields: Record<string, string> }[]
      }
      upserts.push(body.notes.length)
      writes.push('notes')
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
    if (request.method === 'PUT' && url.pathname.startsWith('/sets/')) {
      const body = (await request.json()) as { noteIds: string[] }
      sets.set(decodeURIComponent(url.pathname.slice('/sets/'.length)), body.noteIds)
      return json({ count: body.noteIds.length })
    }
    return json({ error: 'not found' }, 404)
  }
  return { notes, upserts, sets, tagColors, writes, fetch: handler }
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
          { id: 'a', title: 'a', tags: ['x', 'x/y'] },
          { id: 'b', title: 'b', tags: [] },
        ],
        deleted: [],
        unchanged: [],
      },
      tagColors: { x: 0, 'x/y': 1 },
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
    expect(result.notes.updated).toEqual([{ id: 'b', title: 'b', tags: [] }])
    expect(result.notes.unchanged).toEqual([{ id: 'a', title: 'a', tags: [] }])
    expect(cache.notes.get('b')?.['body']).toBe('edited')
  })

  it('deletes cached notes of the source that are gone from it', async () => {
    const cache = fakeCache()
    await syncNotes('file', loaded(note('a'), note('b')), { fetch: cache.fetch })

    const result = await syncNotes('file', loaded(note('a')), { fetch: cache.fetch })

    expect(result).toMatchObject({ synced: 0, unchanged: 1, deleted: 1 })
    expect(result.notes.deleted).toEqual([{ id: 'b', title: 'b', tags: [] }])
    expect([...cache.notes.keys()]).toEqual(['a'])
  })

  it('never deletes the notes of another source, in either direction', async () => {
    const cache = fakeCache()
    await syncNotes('file', loaded(note('f')), { fetch: cache.fetch })
    await syncNotes('bear', loaded(note('b', { source: 'bear' })), { fetch: cache.fetch })

    const bearEmpty = await syncNotes('bear', loaded(), { fetch: cache.fetch })
    expect(bearEmpty.notes.deleted).toEqual([{ id: 'b', title: 'b', tags: [] }])
    expect([...cache.notes.keys()]).toEqual(['f'])

    await syncNotes('bear', loaded(note('b', { source: 'bear' })), { fetch: cache.fetch })
    const fileEmpty = await syncNotes('file', loaded(), { fetch: cache.fetch })
    expect(fileEmpty.notes.deleted).toEqual([{ id: 'f', title: 'f', tags: [] }])
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
    expect(result.notes.deleted).toEqual([{ id: 'orphan', title: 'orphan', tags: [] }])
  })

  it('syncs to the cache named by baseUrl', async () => {
    const urls: string[] = []
    const spy = ((input: Request | URL | string, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init)
      urls.push(request.url)
      const { pathname } = new URL(request.url)
      const body = pathname.startsWith('/sets/')
        ? '{"count":0}'
        : pathname === '/tag-colors'
          ? '{"tags":[]}'
          : '[]'
      return Promise.resolve(
        new Response(body, { status: 200, headers: { 'content-type': 'application/json' } }),
      )
    }) as typeof fetch

    await syncNotes('file', loaded(), { baseUrl: 'http://cache.test', fetch: spy })

    expect(urls[0]).toMatch(/^http:\/\/cache\.test\/notes/)
    expect(urls.at(-1)).toMatch(/^http:\/\/cache\.test\/sets\//)
  })

  describe('tag colors', () => {
    it('gives the new tags colours and keeps them in the cache', async () => {
      const cache = fakeCache()

      const result = await syncNotes(
        'file',
        loaded(note('a', { tags: ['work', 'home'] }), note('b', { tags: ['work'] })),
        { fetch: cache.fetch },
      )

      expect(Object.fromEntries(cache.tagColors)).toEqual({ home: 0, work: 1 })
      expect(result.tagColors).toEqual({ home: 0, work: 1 })
    })

    it('keeps the colours the cache already has and adds only the new tags', async () => {
      const cache = fakeCache()
      cache.tagColors.set('work', 9)

      const result = await syncNotes('file', loaded(note('a', { tags: ['work', 'home'] })), {
        fetch: cache.fetch,
      })

      expect(Object.fromEntries(cache.tagColors)).toEqual({ work: 9, home: 0 })
      expect(result.tagColors).toEqual({ work: 9, home: 0 })
    })

    it('gives the same colours on the next sync', async () => {
      const cache = fakeCache()
      const first = await syncNotes('file', loaded(note('a', { tags: ['b', 'a'] })), {
        fetch: cache.fetch,
      })

      const second = await syncNotes(
        'file',
        loaded(note('a', { tags: ['b', 'a'] }), note('c', { tags: ['c'] })),
        { fetch: cache.fetch },
      )

      expect(second.tagColors).toEqual({ ...first.tagColors, c: 2 })
    })

    it('counts the tags of notes that did not change', async () => {
      const cache = fakeCache()
      await syncNotes('file', loaded(note('a', { tags: ['old'] })), { fetch: cache.fetch })
      cache.tagColors.clear()

      const result = await syncNotes('file', loaded(note('a', { tags: ['old'] })), {
        fetch: cache.fetch,
      })

      expect(result.synced).toBe(0)
      expect(result.tagColors).toEqual({ old: 0 })
    })

    it('adds the colours before it pushes any note', async () => {
      const cache = fakeCache()

      await syncNotes('file', loaded(note('a', { tags: ['x'] })), { fetch: cache.fetch })

      expect(cache.writes).toEqual(['tag-colors', 'notes'])
    })

    it('does not write colours when every tag has one', async () => {
      const cache = fakeCache()
      cache.tagColors.set('x', 4)

      await syncNotes('file', loaded(note('a', { tags: ['x'] })), { fetch: cache.fetch })

      expect(cache.writes).toEqual(['notes'])
    })

    it('does not write colours for notes without tags', async () => {
      const cache = fakeCache()

      const result = await syncNotes('file', loaded(note('a')), { fetch: cache.fetch })

      expect(cache.writes).toEqual(['notes'])
      expect(result.tagColors).toEqual({})
    })

    it('puts the tags of a deleted note in the result', async () => {
      const cache = fakeCache()
      cache.notes.set('gone', { source: 'file', title: 'gone', tags: '["a","b"]' })

      const result = await syncNotes('file', loaded(), { fetch: cache.fetch })

      expect(result.notes.deleted).toEqual([{ id: 'gone', title: 'gone', tags: ['a', 'b'] }])
    })

    it.each([
      ['not json', 'oops'],
      ['not a list', '{"a":1}'],
    ])('reads the tags of a deleted note as none when they are %s', async (_name, tags) => {
      const cache = fakeCache()
      cache.notes.set('gone', { source: 'file', title: 'gone', tags })

      const result = await syncNotes('file', loaded(), { fetch: cache.fetch })

      expect(result.notes.deleted).toEqual([{ id: 'gone', title: 'gone', tags: [] }])
    })

    it('keeps only the string tags of a deleted note', async () => {
      const cache = fakeCache()
      cache.notes.set('gone', { source: 'file', title: 'gone', tags: '["a",1,null]' })

      const result = await syncNotes('file', loaded(), { fetch: cache.fetch })

      expect(result.notes.deleted[0]?.tags).toEqual(['a'])
    })

    it('changes nothing when the colours cannot be read', async () => {
      const cache = fakeCache()
      cache.notes.set('old', { source: 'file', title: 'old' })
      const failing = ((input: Request | URL | string, init?: RequestInit) => {
        const request = input instanceof Request ? input : new Request(input, init)
        return new URL(request.url).pathname === '/tag-colors'
          ? Promise.resolve(new Response('boom', { status: 500 }))
          : cache.fetch(request, init)
      }) as typeof fetch

      await expect(
        syncNotes('file', loaded(note('a', { tags: ['x'] })), { fetch: failing }),
      ).rejects.toBeDefined()
      expect(cache.writes).toEqual([])
      expect(cache.notes.has('old')).toBe(true)
    })
  })

  describe('automatic sets', () => {
    const now = new Date(2026, 9, 27, 12, 0, 0)
    const today = new Date(2026, 9, 27, 8, 0, 0).toISOString()
    const lastWeek = new Date(2026, 9, 20, 8, 0, 0).toISOString()

    it('pushes the four sets of a bear sync', async () => {
      const cache = fakeCache()
      await syncNotes(
        'bear',
        loaded(
          note('new', { source: 'bear', created: today, modified: today }),
          note('old', { source: 'bear', created: PAST, modified: lastWeek }),
        ),
        { fetch: cache.fetch, now },
      )
      expect(Object.fromEntries(cache.sets)).toEqual({
        'bear:created-today': ['new'],
        'bear:modified-today': ['new'],
        'bear:created-last-30-days': ['new'],
        'bear:modified-last-30-days': ['new', 'old'],
      })
    })

    it('pushes only the modified sets of a file sync', async () => {
      const cache = fakeCache()
      await syncNotes('file', loaded(note('a', { modified: today })), { fetch: cache.fetch, now })
      expect([...cache.sets.keys()].sort()).toEqual([
        'file:modified-last-30-days',
        'file:modified-today',
      ])
    })

    it('recomputes the sets when no note changed', async () => {
      const cache = fakeCache()
      await syncNotes('file', loaded(note('a', { modified: today })), { fetch: cache.fetch, now })
      const later = new Date(2026, 9, 28, 12, 0, 0)
      await syncNotes('file', loaded(note('a', { modified: today })), {
        fetch: cache.fetch,
        now: later,
      })
      expect(cache.sets.get('file:modified-today')).toEqual([])
      expect(cache.sets.get('file:modified-last-30-days')).toEqual(['a'])
    })

    it('uses the current time by default', async () => {
      const cache = fakeCache()
      await syncNotes('file', loaded(note('a', { modified: new Date().toISOString() })), {
        fetch: cache.fetch,
      })
      expect(cache.sets.get('file:modified-last-30-days')).toEqual(['a'])
    })

    it('leaves the other source sets alone', async () => {
      const cache = fakeCache()
      cache.sets.set('bear:modified-today', ['keep'])
      await syncNotes('file', loaded(note('a')), { fetch: cache.fetch, now })
      expect(cache.sets.get('bear:modified-today')).toEqual(['keep'])
    })
  })
})
