// @vitest-environment node
import type { Note } from '../../src/pipeline/notes'
import { syncNotes } from '../../src/pipeline/sync'
import type { SyncProgress } from '../../src/types'

interface FakeSet {
  source: string
  grouping: string
  id: string
  color: number
  rank: number
  noteIds: string[]
}

/** a minimal in-memory stand-in for the cache service's notes and sets routes. */
function fakeCache() {
  const notes = new Map<string, Record<string, string>>()
  const upserts: number[] = []
  /** the sets by `<source>:<grouping>:<id>`. */
  const sets = new Map<string, FakeSet>()
  /** the writes that reached the cache, in order. */
  const writes: string[] = []
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

  const handler = async (input: Request | URL | string, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init)
    const url = new URL(request.url)
    if (request.method === 'GET' && url.pathname === '/notes') {
      const wanted = (url.searchParams.get('fields') ?? '').split(',')
      const includeDeleted = url.searchParams.get('grouping') === 'sync'
      return json(
        [...notes]
          .filter(([, fields]) => includeDeleted || fields['deleted'] === undefined)
          .map(([id, fields]) => ({
            id,
            fields: Object.fromEntries(
              Object.entries(fields).filter(([name]) => wanted.includes(name)),
            ),
          })),
      )
    }
    if (request.method === 'GET' && url.pathname === '/sets') {
      const source = url.searchParams.get('source')
      const grouping = url.searchParams.get('grouping')
      return json(
        [...sets.values()]
          .filter(
            (set) => (!source || set.source === source) && (!grouping || set.grouping === grouping),
          )
          .map(({ noteIds, ...set }) => ({ ...set, count: noteIds.length, updated: 'now' })),
      )
    }
    if (request.method === 'PUT' && url.pathname === '/notes') {
      const body = (await request.json()) as {
        notes: { id: string; fields: Record<string, string> }[]
      }
      upserts.push(body.notes.length)
      writes.push('notes')
      for (const note of body.notes) {
        const kept = { ...notes.get(note.id) }
        delete kept['deleted']
        notes.set(note.id, { ...kept, ...note.fields, synced: new Date().toISOString() })
      }
      return json({ upserted: body.notes.length })
    }
    if (request.method === 'DELETE' && url.pathname.startsWith('/notes/')) {
      const id = decodeURIComponent(url.pathname.slice('/notes/'.length))
      const note = notes.get(id)
      if (note) note['deleted'] = new Date().toISOString()
      return new Response(null, { status: 204 })
    }
    if (request.method === 'PUT' && url.pathname === '/sets') {
      const set = (await request.json()) as FakeSet
      writes.push('sets')
      sets.set(`${set.source}:${set.grouping}:${set.id}`, set)
      return json({ count: set.noteIds.length })
    }
    return json({ error: 'not found' }, 404)
  }
  return { notes, upserts, sets, writes, fetch: handler }
}

/** the sets of one source and grouping as `id -> note ids`. */
function membersOf(cache: ReturnType<typeof fakeCache>, source: string, grouping: string) {
  return Object.fromEntries(
    [...cache.sets.values()]
      .filter((set) => set.source === source && set.grouping === grouping)
      .map((set) => [set.id, set.noteIds]),
  )
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
    expect(cache.notes.get('b')).toHaveProperty('deleted')
    expect(cache.notes.get('a')).not.toHaveProperty('deleted')
  })

  it('never deletes the notes of another source, in either direction', async () => {
    const cache = fakeCache()
    await syncNotes('file', loaded(note('f')), { fetch: cache.fetch })
    await syncNotes('bear', loaded(note('b', { source: 'bear' })), { fetch: cache.fetch })

    const bearEmpty = await syncNotes('bear', loaded(), { fetch: cache.fetch })
    expect(bearEmpty.notes.deleted).toEqual([{ id: 'b', title: 'b', tags: [] }])
    expect(cache.notes.get('b')).toHaveProperty('deleted')
    expect(cache.notes.get('f')).not.toHaveProperty('deleted')

    await syncNotes('bear', loaded(note('b', { source: 'bear' })), { fetch: cache.fetch })
    const fileEmpty = await syncNotes('file', loaded(), { fetch: cache.fetch })
    expect(fileEmpty.notes.deleted).toEqual([{ id: 'f', title: 'f', tags: [] }])
    expect(cache.notes.get('f')).toHaveProperty('deleted')
    expect(cache.notes.get('b')).not.toHaveProperty('deleted')
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
    expect([...cache.notes.values()].every((fields) => fields['deleted'])).toBe(true)
    expect(updates.at(-1)).toEqual({ synced: 0, deleted: 45, total: 45 })
  })

  it('deletes nothing when the cache cannot be listed', async () => {
    const cache = fakeCache()
    await syncNotes('file', loaded(note('a')), { fetch: cache.fetch })
    const failing = (() => Promise.resolve(new Response('boom', { status: 500 }))) as typeof fetch

    await expect(syncNotes('file', loaded(), { fetch: failing })).rejects.toBeDefined()
    expect(cache.notes.get('a')).not.toHaveProperty('deleted')
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
    expect(cache.notes.get('b')).not.toHaveProperty('deleted')
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
      const body = pathname === '/sets' && request.method === 'PUT' ? '{"count":0}' : '[]'
      return Promise.resolve(
        new Response(body, { status: 200, headers: { 'content-type': 'application/json' } }),
      )
    }) as typeof fetch

    await syncNotes('file', loaded(), { baseUrl: 'http://cache.test', fetch: spy })

    expect(urls[0]).toMatch(/^http:\/\/cache\.test\/notes/)
    expect(urls.at(-1)).toMatch(/^http:\/\/cache\.test\/sets$/)
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

  it('brings a note back when its id is pushed again', async () => {
    const cache = fakeCache()
    await syncNotes('file', loaded(note('a')), { fetch: cache.fetch })
    await syncNotes('file', loaded(), { fetch: cache.fetch })
    expect(cache.notes.get('a')).toHaveProperty('deleted')

    await syncNotes('file', loaded(note('a', { modified: FUTURE })), { fetch: cache.fetch })

    expect(cache.notes.get('a')).not.toHaveProperty('deleted')
  })

  describe('tag sets', () => {
    it('puts each note in the set of its first tag, by its top level', async () => {
      const cache = fakeCache()

      await syncNotes(
        'bear',
        loaded(
          note('a', { source: 'bear', tags: ['daily/10/28', 'work'] }),
          note('b', { source: 'bear', tags: ['daily/10/29', 'daily'] }),
          note('c', { source: 'bear' }),
          note('d', { source: 'bear', tags: ['work', 'daily'] }),
        ),
        { fetch: cache.fetch },
      )

      expect(membersOf(cache, 'bear', 'tags')).toEqual({ daily: ['a', 'b'], work: ['d'] })
    })

    it('gives the new sets colours, per grouping and source, and keeps them', async () => {
      const cache = fakeCache()
      await syncNotes(
        'file',
        loaded(note('a', { tags: ['work'] }), note('b', { tags: ['home'] })),
        {
          fetch: cache.fetch,
        },
      )
      const color = (key: string) => cache.sets.get(key)?.color
      expect(color('file:tags:home')).toBe(0)
      expect(color('file:tags:work')).toBe(1)
      // the sync grouping starts again from the first colour
      expect(color('file:sync:deleted-last-30-days')).toBe(0)

      await syncNotes(
        'file',
        loaded(
          note('a', { tags: ['work'] }),
          note('b', { tags: ['home'] }),
          note('c', { tags: ['c'] }),
        ),
        {
          fetch: cache.fetch,
        },
      )
      expect(color('file:tags:home')).toBe(0)
      expect(color('file:tags:work')).toBe(1)
      expect(color('file:tags:c')).toBe(2)
    })

    it('keeps the colour the cache already has for a set', async () => {
      const cache = fakeCache()
      cache.sets.set('file:tags:work', {
        source: 'file',
        grouping: 'tags',
        id: 'work',
        color: 9,
        rank: 0,
        noteIds: [],
      })

      await syncNotes(
        'file',
        loaded(note('a', { tags: ['work'] }), note('b', { tags: ['home'] })),
        {
          fetch: cache.fetch,
        },
      )

      expect(cache.sets.get('file:tags:work')?.color).toBe(9)
      expect(cache.sets.get('file:tags:home')?.color).toBe(0)
    })

    it('empties the set of a tag no note has any more and keeps its colour', async () => {
      const cache = fakeCache()
      await syncNotes('file', loaded(note('a', { tags: ['old'] })), { fetch: cache.fetch })

      await syncNotes('file', loaded(note('a', { tags: ['new'], modified: FUTURE })), {
        fetch: cache.fetch,
      })

      expect(membersOf(cache, 'file', 'tags')).toEqual({ new: ['a'], old: [] })
      expect(cache.sets.get('file:tags:old')?.color).toBe(0)
    })

    it('leaves deleted notes out of the tag sets', async () => {
      const cache = fakeCache()
      await syncNotes('file', loaded(note('a', { tags: ['x'] }), note('b', { tags: ['x'] })), {
        fetch: cache.fetch,
      })

      await syncNotes('file', loaded(note('a', { tags: ['x'] })), { fetch: cache.fetch })

      expect(membersOf(cache, 'file', 'tags')).toEqual({ x: ['a'] })
    })

    it('keeps the tag sets of the other source alone', async () => {
      const cache = fakeCache()
      await syncNotes('bear', loaded(note('b', { source: 'bear', tags: ['x'] })), {
        fetch: cache.fetch,
      })

      await syncNotes('file', loaded(note('f', { tags: ['y'] })), { fetch: cache.fetch })

      expect(membersOf(cache, 'bear', 'tags')).toEqual({ x: ['b'] })
      expect(membersOf(cache, 'file', 'tags')).toEqual({ y: ['f'] })
    })

    it('keeps the notes that could not be read in their sets', async () => {
      const cache = fakeCache()
      await syncNotes('file', loaded(note('a', { tags: ['x'] }), note('b', { tags: ['x'] })), {
        fetch: cache.fetch,
      })

      await syncNotes(
        'file',
        { notes: [note('a', { tags: ['x'] })], failed: ['b'] },
        {
          fetch: cache.fetch,
        },
      )

      expect(membersOf(cache, 'file', 'tags')).toEqual({ x: ['a', 'b'] })
    })
  })

  describe('sync sets', () => {
    const now = new Date(2026, 9, 27, 12, 0, 0)

    it('puts the notes in the updated, created and unchanged sets of a bear sync', async () => {
      const cache = fakeCache()
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(now)
      try {
        await syncNotes(
          'bear',
          loaded(note('new', { source: 'bear', created: now.toISOString() })),
          { fetch: cache.fetch, now },
        )
        // a note synced 40 days ago
        cache.notes.set('old', {
          source: 'bear',
          title: 'old',
          synced: new Date(2026, 8, 10, 12, 0, 0).toISOString(),
          created: new Date(2020, 0, 1).toISOString(),
        })

        await syncNotes(
          'bear',
          loaded(
            note('new', { source: 'bear', created: now.toISOString() }),
            note('old', { source: 'bear', modified: PAST }),
          ),
          {
            fetch: cache.fetch,
            now,
          },
        )
      } finally {
        vi.useRealTimers()
      }

      expect(membersOf(cache, 'bear', 'sync')).toEqual({
        'created-today': ['new'],
        'created-last-30-days': [],
        'updated-today': [],
        'updated-last-30-days': [],
        'deleted-today': [],
        'deleted-last-30-days': [],
        unchanged: ['old'],
      })
      expect(cache.sets.get('bear:sync:created-today')?.rank).toBe(0)
      expect(cache.sets.get('bear:sync:unchanged')?.rank).toBe(6)
      expect(cache.sets.get('bear:sync:updated-today')?.rank).toBe(1)
    })

    it('lists deleted notes in the deleted sets, not in the others', async () => {
      const cache = fakeCache()
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(now)
      try {
        await syncNotes('file', loaded(note('a'), note('b')), { fetch: cache.fetch, now })
        await syncNotes('file', loaded(note('a')), { fetch: cache.fetch, now })
      } finally {
        vi.useRealTimers()
      }

      const sync = membersOf(cache, 'file', 'sync')
      expect(sync['deleted-today']).toEqual(['b'])
      expect(sync['deleted-last-30-days']).toEqual([])
      expect(sync['updated-today']).toEqual(['a'])
    })

    it('makes no created sets for the file source', async () => {
      const cache = fakeCache()
      await syncNotes('file', loaded(note('a')), { fetch: cache.fetch, now })
      expect(Object.keys(membersOf(cache, 'file', 'sync'))).toEqual([
        'updated-today',
        'updated-last-30-days',
        'deleted-today',
        'deleted-last-30-days',
        'unchanged',
      ])
    })

    it('recomputes the sets when no note changed', async () => {
      const cache = fakeCache()
      await syncNotes('file', loaded(note('a')), { fetch: cache.fetch })
      const synced = Date.parse(cache.notes.get('a')?.['synced'] ?? '')
      const later = new Date(synced + 40 * 24 * 60 * 60 * 1000)

      await syncNotes('file', loaded(note('a')), { fetch: cache.fetch, now: later })

      const sync = membersOf(cache, 'file', 'sync')
      expect(sync['updated-last-30-days']).toEqual([])
      expect(sync['unchanged']).toEqual(['a'])
    })

    it('uses the current time by default', async () => {
      const cache = fakeCache()
      await syncNotes('file', loaded(note('a')), { fetch: cache.fetch })
      expect(membersOf(cache, 'file', 'sync')['updated-today']).toEqual(['a'])
    })

    it('leaves the sync sets of the other source alone', async () => {
      const cache = fakeCache()
      await syncNotes('bear', loaded(note('b', { source: 'bear' })), { fetch: cache.fetch })
      const before = membersOf(cache, 'bear', 'sync')

      await syncNotes('file', loaded(note('a')), { fetch: cache.fetch })

      expect(membersOf(cache, 'bear', 'sync')).toEqual(before)
    })

    it('replaces no set when the cache cannot be read', async () => {
      const cache = fakeCache()
      const failing = ((input: Request | URL | string, init?: RequestInit) => {
        const request = input instanceof Request ? input : new Request(input, init)
        return new URL(request.url).pathname === '/sets' && request.method === 'GET'
          ? Promise.resolve(new Response('boom', { status: 500 }))
          : cache.fetch(request, init)
      }) as typeof fetch

      await expect(syncNotes('file', loaded(note('a')), { fetch: failing })).rejects.toBeDefined()
      expect(cache.sets.size).toBe(0)
    })
  })
})
