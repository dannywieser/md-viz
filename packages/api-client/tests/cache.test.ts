import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cacheClient,
  configureCacheClient,
  getNote,
  listNotes,
  upsertNotes,
  zNoteRow,
  zUpsertBody,
} from '../src/cache'
import { listNotesOptions } from '../src/cache/react-query'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

function stubFetch(response: () => Response) {
  const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(response()))
  configureCacheClient({ baseUrl: 'http://cache.test', fetch: fetchMock })
  return fetchMock
}

describe('cache schemas', () => {
  it('keeps the fields of a list row', () => {
    const row = { id: 'a', fields: { title: 'plan' } }
    expect(zNoteRow.parse(row)).toEqual(row)
  })

  it('rejects ids and field names the server rejects', () => {
    expect(zUpsertBody.safeParse({ notes: [{ id: 'a/b', fields: {} }] }).success).toBe(false)
    expect(zUpsertBody.safeParse({ notes: [{ id: '', fields: {} }] }).success).toBe(false)
    expect(zUpsertBody.safeParse({ notes: [{ id: 'a', fields: { title: 1 } }] }).success).toBe(
      false,
    )
  })
})

describe('cache sdk', () => {
  afterEach(() => {
    cacheClient.setConfig({ baseUrl: '', fetch: undefined })
  })

  it('sends a valid request to the configured base url and returns the validated body', async () => {
    const fetchMock = stubFetch(() => json([{ id: 'a', fields: { title: 'plan' } }]))
    const result = await listNotes({ query: { fields: 'title' } })
    expect(result.data).toEqual([{ id: 'a', fields: { title: 'plan' } }])
    const request = fetchMock.mock.calls[0][0] as Request
    expect(request.url).toBe('http://cache.test/notes?fields=title')
  })

  it('rejects an invalid request before sending it', async () => {
    const fetchMock = stubFetch(() => json({ upserted: 1 }))
    await expect(
      upsertNotes({ body: { notes: [{ id: 'a/b', fields: {} }] }, throwOnError: true }),
    ).rejects.toThrow()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a response that does not match the schema', async () => {
    stubFetch(() => json({ fields: { title: 1 } }))
    await expect(getNote({ path: { id: 'a' }, throwOnError: true })).rejects.toThrow()
  })

  it('builds query options for react-query', () => {
    const options = listNotesOptions({ query: { fields: 'title' } })
    expect(options.queryKey[0]._id).toBe('listNotes')
    expect(options.queryKey[0].query).toEqual({ fields: 'title' })
  })
})
