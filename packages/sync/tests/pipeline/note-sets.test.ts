// @vitest-environment node
import { loadNoteSets } from '../../src/pipeline/note-sets'

interface FakeSet {
  source: string
  grouping: string
  id: string
  color: number
  rank: number
  noteIds: string[]
}

const sets: FakeSet[] = [
  { source: 'bear', grouping: 'sync', id: 'created-today', color: 3, rank: 0, noteIds: ['a'] },
  { source: 'bear', grouping: 'sync', id: 'updated-today', color: 5, rank: 1, noteIds: [] },
  { source: 'bear', grouping: 'sync', id: 'unchanged', color: 0, rank: 6, noteIds: ['b', 'gone'] },
  { source: 'file', grouping: 'sync', id: 'unchanged', color: 9, rank: 6, noteIds: ['f'] },
  { source: 'bear', grouping: 'tags', id: 'daily', color: 1, rank: 0, noteIds: ['a', 'b'] },
]

const titles: Record<string, string | undefined> = { a: 'first', b: undefined, f: 'file one' }

/** a minimal stand-in for the cache's list-sets, get-set and list-notes routes. */
function fakeCache() {
  const requests: string[] = []
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
  const handler = (input: Request | URL | string, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init)
    const url = new URL(request.url)
    requests.push(`${url.pathname}?${url.searchParams.toString()}`)
    const pick = (name: string) => url.searchParams.get(name)
    if (url.pathname === '/sets') {
      return Promise.resolve(
        json(
          sets
            .filter((set) => set.source === pick('source') && set.grouping === pick('grouping'))
            .map(({ noteIds, ...set }) => ({ ...set, count: noteIds.length, updated: 'now' })),
        ),
      )
    }
    if (url.pathname === '/set') {
      const found = sets.find(
        (set) =>
          set.source === pick('source') &&
          set.grouping === pick('grouping') &&
          set.id === pick('id'),
      )
      if (!found) return Promise.resolve(json({ error: 'unknown set' }, 404))
      const { noteIds, ...set } = found
      return Promise.resolve(json({ ...set, count: noteIds.length, updated: 'now', noteIds }))
    }
    if (url.pathname === '/notes') {
      return Promise.resolve(
        json(
          Object.entries(titles).map(([id, title]) => ({
            id,
            fields: title === undefined ? {} : { title },
          })),
        ),
      )
    }
    return Promise.resolve(json({ error: 'not found' }, 404))
  }
  return { fetch: handler, requests }
}

describe('loadNoteSets', () => {
  it('returns the sets of the source and grouping in the cache order, with colours and titled notes', async () => {
    const cache = fakeCache()

    const result = await loadNoteSets('bear', { grouping: 'sync', fetch: cache.fetch })

    expect(result).toEqual([
      {
        id: 'created-today',
        name: 'created-today',
        color: 3,
        notes: [{ id: 'a', title: 'first' }],
      },
      { id: 'updated-today', name: 'updated-today', color: 5, notes: [] },
      {
        id: 'unchanged',
        name: 'unchanged',
        color: 0,
        notes: [
          { id: 'b', title: 'b' },
          { id: 'gone', title: 'gone' },
        ],
      },
    ])
  })

  it('leaves out the sets of another source or grouping', async () => {
    const cache = fakeCache()

    const files = await loadNoteSets('file', { grouping: 'sync', fetch: cache.fetch })
    const tags = await loadNoteSets('bear', { grouping: 'tags', fetch: cache.fetch })

    expect(files.map((set) => [set.id, set.color])).toEqual([['unchanged', 9]])
    expect(tags.map((set) => set.id)).toEqual(['daily'])
  })

  it('reads the notes with the grouping, so the sync grouping includes deleted ones', async () => {
    const cache = fakeCache()

    await loadNoteSets('bear', { grouping: 'sync', fetch: cache.fetch })

    expect(cache.requests).toContain('/notes?fields=title&grouping=sync')
  })

  it('does not ask for the notes of an empty set', async () => {
    const cache = fakeCache()

    await loadNoteSets('bear', { grouping: 'sync', fetch: cache.fetch })

    expect(cache.requests.filter((request) => request.includes('id=updated-today'))).toEqual([])
  })

  it('returns no sets when the cache has none', async () => {
    const cache = fakeCache()

    expect(await loadNoteSets('bear', { grouping: 'nothing', fetch: cache.fetch })).toEqual([])
  })

  it('rejects a source it does not know before asking the cache', async () => {
    const cache = fakeCache()

    await expect(
      loadNoteSets('evernote', { grouping: 'sync', fetch: cache.fetch }),
    ).rejects.toThrow('expected a source')
    expect(cache.requests).toEqual([])
  })

  it('fails when the cache fails', async () => {
    const failing = (() => Promise.resolve(new Response('boom', { status: 500 }))) as typeof fetch

    await expect(loadNoteSets('bear', { grouping: 'sync', fetch: failing })).rejects.toBeDefined()
  })

  it('uses the default cache URL unless one is given', async () => {
    const seen: string[] = []
    const spy = ((input: Request | URL | string) => {
      seen.push(input instanceof Request ? input.url : String(input))
      return Promise.resolve(
        new Response('[]', { headers: { 'content-type': 'application/json' } }),
      )
    }) as typeof fetch

    await loadNoteSets('bear', { grouping: 'sync', fetch: spy })
    await loadNoteSets('bear', { grouping: 'sync', fetch: spy, baseUrl: 'http://cache:1' })

    expect(seen[0]).toMatch(/^http:\/\/localhost:8787\/sets/)
    expect(seen.at(-1)).toMatch(/^http:\/\/cache:1\//)
  })

  it('uses the global fetch when none is given', async () => {
    const cache = fakeCache()
    vi.stubGlobal('fetch', cache.fetch)
    // the cache client keeps what an earlier call configured, so this one starts from a fresh one.
    vi.resetModules()
    try {
      const fresh = await import('../../src/pipeline/note-sets')
      const result = await fresh.loadNoteSets('file', { grouping: 'sync' })

      expect(result.map((set) => set.id)).toEqual(['unchanged'])
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
