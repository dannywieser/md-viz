// @vitest-environment node
import { mkdir, mkdtemp, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { noteId, noteTitle, syncFolder } from '../../src/main/sync'
import type { SyncProgress } from '../../src/shared/ipc'

// real by default; a few tests make a file vanish or fail to read mid-sync.
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return { ...actual, stat: vi.fn(actual.stat), readFile: vi.fn(actual.readFile) }
})

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

describe('noteId and noteTitle', () => {
  it('derives a stable 16-char slash-free id from the relative path', () => {
    expect(noteId('a/b.md')).toMatch(/^[0-9a-f]{16}$/)
    expect(noteId('a/b.md')).toBe(noteId('a/b.md'))
    expect(noteId('a/b.md')).not.toBe(noteId('b.md'))
  })

  it('strips the md extension from the file name only', () => {
    expect(noteTitle('sub/plan.md')).toBe('plan')
    expect(noteTitle('Plan.MD')).toBe('Plan')
    expect(noteTitle('a.md.md')).toBe('a.md')
  })
})

describe('syncFolder', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'md-viz-sync-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  const write = (name: string, content: string) => writeFile(path.join(root, name), content)

  it('pushes every note on the first sync with title and body', async () => {
    await mkdir(path.join(root, 'sub'))
    await write('plan.md', '# plan')
    await write('sub/plants.md', 'tomatoes')
    await write('skip.txt', 'no')
    const cache = fakeCache()

    const result = await syncFolder(root, { fetch: cache.fetch })

    expect(result).toEqual({
      scanned: 2,
      synced: 2,
      unchanged: 0,
      deleted: 0,
      failed: 0,
      notes: {
        updated: expect.arrayContaining([
          { id: noteId('plan.md'), title: 'plan' },
          { id: noteId('sub/plants.md'), title: 'plants' },
        ]) as unknown,
        deleted: [],
        unchanged: [],
      },
    })
    expect(cache.notes.get(noteId('plan.md'))).toMatchObject({ title: 'plan', body: '# plan' })
    expect(cache.notes.get(noteId('sub/plants.md'))).toMatchObject({
      title: 'plants',
      body: 'tomatoes',
    })
  })

  it('skips unchanged notes and pushes only edited ones', async () => {
    await write('a.md', 'one')
    await write('b.md', 'two')
    const cache = fakeCache()
    await syncFolder(root, { fetch: cache.fetch })

    const future = new Date(Date.now() + 60_000)
    await write('b.md', 'two edited')
    await utimes(path.join(root, 'b.md'), future, future)
    const result = await syncFolder(root, { fetch: cache.fetch })

    expect(result).toMatchObject({ synced: 1, unchanged: 1, deleted: 0 })
    expect(result.notes.updated).toEqual([{ id: noteId('b.md'), title: 'b' }])
    expect(result.notes.unchanged).toEqual([{ id: noteId('a.md'), title: 'a' }])
    expect(cache.notes.get(noteId('b.md'))?.['body']).toBe('two edited')
  })

  it('deletes cached notes whose file is gone', async () => {
    await write('a.md', 'one')
    await write('b.md', 'two')
    const cache = fakeCache()
    await syncFolder(root, { fetch: cache.fetch })

    await rm(path.join(root, 'b.md'))
    const result = await syncFolder(root, { fetch: cache.fetch })

    expect(result).toMatchObject({ synced: 0, unchanged: 1, deleted: 1 })
    expect(result.notes.deleted).toEqual([{ id: noteId('b.md'), title: 'b' }])
    expect([...cache.notes.keys()]).toEqual([noteId('a.md')])
  })

  it('upserts in batches of 200 and reports progress', async () => {
    await Promise.all(Array.from({ length: 450 }, (_, i) => write(`n${i}.md`, `note ${i}`)))
    const cache = fakeCache()
    const updates: SyncProgress[] = []

    const result = await syncFolder(root, {
      fetch: cache.fetch,
      onProgress: (p) => updates.push(p),
    })

    expect(result.synced).toBe(450)
    expect(cache.upserts).toEqual([200, 200, 50])
    expect(updates[0]).toEqual({ synced: 0, deleted: 0, total: 450 })
    expect(updates.at(-1)).toEqual({ synced: 450, deleted: 0, total: 450 })
  })

  it('deletes nothing when the cache cannot be listed', async () => {
    await write('a.md', 'one')
    const cache = fakeCache()
    await syncFolder(root, { fetch: cache.fetch })
    await rm(path.join(root, 'a.md'))

    const failing = (() => Promise.resolve(new Response('boom', { status: 500 }))) as typeof fetch

    await expect(syncFolder(root, { fetch: failing })).rejects.toBeDefined()
    expect(cache.notes.size).toBe(1)
  })

  it('fails on a missing folder instead of wiping the cache', async () => {
    const cache = fakeCache()
    cache.notes.set('abc', { title: 'x' })

    await expect(syncFolder(path.join(root, 'missing'), { fetch: cache.fetch })).rejects.toThrow()
    expect(cache.notes.size).toBe(1)
  })

  it('skips a file that vanishes before it is read', async () => {
    await write('a.md', 'one')
    await write('b.md', 'two')
    const cache = fakeCache()
    vi.mocked(stat).mockRejectedValueOnce(new Error('ENOENT'))

    const result = await syncFolder(root, { fetch: cache.fetch })

    expect(result.scanned).toBe(1)
    expect(result.synced).toBe(1)
  })

  it('counts a file that cannot be read as failed and leaves it out of the updates', async () => {
    await write('a.md', 'one')
    await write('b.md', 'two')
    const cache = fakeCache()
    vi.mocked(readFile).mockRejectedValueOnce(new Error('EACCES'))

    const result = await syncFolder(root, { fetch: cache.fetch })

    expect(result).toMatchObject({ scanned: 2, synced: 1, failed: 1 })
    expect(result.notes.updated).toHaveLength(1)
    expect(cache.notes.size).toBe(1)
  })

  it('does not call the cache when no file could be read', async () => {
    await write('a.md', 'one')
    const cache = fakeCache()
    vi.mocked(readFile).mockRejectedValueOnce(new Error('EACCES'))

    const result = await syncFolder(root, { fetch: cache.fetch })

    expect(result).toMatchObject({ synced: 0, failed: 1 })
    expect(cache.upserts).toEqual([])
  })

  it('treats cached notes without a title or sync time as stale, titling deletions by id', async () => {
    await write('a.md', 'one')
    const cache = fakeCache()
    cache.notes.set(noteId('a.md'), {})
    cache.notes.set('orphan', {})

    const result = await syncFolder(root, { fetch: cache.fetch })

    expect(result.synced).toBe(1)
    expect(result.notes.deleted).toEqual([{ id: 'orphan', title: 'orphan' }])
  })
})
