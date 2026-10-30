import { renderHook } from '@testing-library/react'
import { useQueries, useQuery } from '@tanstack/react-query'
import {
  getSetOptions,
  listNotesOptions,
  listSetsOptions,
} from '@md-viz/api-client/cache/react-query'
import { useDashboard } from '../../src/hooks/use-dashboard'

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn(), useQueries: vi.fn() }))
vi.mock('@md-viz/api-client/cache/react-query', () => ({
  listSetsOptions: vi.fn(() => ({ queryKey: ['sets'] })),
  listNotesOptions: vi.fn(() => ({ queryKey: ['notes'] })),
  getSetOptions: vi.fn((options: unknown) => ({ queryKey: ['set', options] })),
}))

const setList = [
  { source: 'bear', grouping: 'tags', id: 'daily', color: 3, rank: 0, count: 2, updated: 'now' },
  { source: 'bear', grouping: 'tags', id: 'empty', color: 5, rank: 0, count: 0, updated: 'now' },
]
const notes = [
  { id: 'a', fields: { title: 'plan' } },
  { id: 'b', fields: {} },
  { id: 'c', fields: { title: 'loose' } },
]
const detail = { ...setList[0], noteIds: ['a', 'b'] }

type Result = Record<string, unknown>

function queries({
  sets = { isPending: false, data: setList },
  notes: notesResult = { isPending: false, data: notes },
  details = [{ isPending: false, data: detail }],
}: { sets?: Result; notes?: Result; details?: Result[] } = {}) {
  vi.mocked(useQuery).mockImplementation(((options: { queryKey: string[] }) =>
    options.queryKey[0] === 'sets' ? sets : notesResult) as unknown as typeof useQuery)
  vi.mocked(useQueries).mockImplementation((options: { combine: (results: Result[]) => unknown }) =>
    options.combine(details),
  )
}

describe('useDashboard', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('asks for the tag sets, the note titles and the notes of each set that has some', () => {
    queries()
    renderHook(() => useDashboard())

    expect(listSetsOptions).toHaveBeenCalledWith({ query: { grouping: 'tags' } })
    expect(listNotesOptions).toHaveBeenCalledWith({ query: { fields: 'title' } })
    expect(getSetOptions).toHaveBeenCalledTimes(1)
    expect(getSetOptions).toHaveBeenCalledWith({
      query: { source: 'bear', grouping: 'tags', id: 'daily' },
    })
  })

  it('asks for no set before the list of sets is there', () => {
    queries({ sets: { isPending: true }, details: [] })
    renderHook(() => useDashboard())

    expect(getSetOptions).not.toHaveBeenCalled()
  })

  it.each([
    ['the sets', { sets: { isPending: true } }],
    ['the notes', { notes: { isPending: true } }],
    ['the notes of a set', { details: [{ isPending: true }] }],
  ])('is pending while %s load', (_name, state) => {
    queries(state)

    expect(renderHook(() => useDashboard()).result.current).toMatchObject({
      status: 'pending',
    })
  })

  it('is ready with the notes in their sets and the rest as untagged', () => {
    queries()
    const { result } = renderHook(() => useDashboard())

    expect(result.current.status).toBe('ready')
    expect(
      result.current.sets.map((set) => [set.name, set.color, set.notes.map((note) => note.title)]),
    ).toEqual([
      ['daily', 3, ['plan', 'b']],
      ['untagged', 24, ['loose']],
    ])
  })

  it('is ready with no sets for a cache with no notes', () => {
    queries({
      sets: { isPending: false, data: [] },
      notes: { isPending: false, data: [] },
      details: [],
    })
    const { result } = renderHook(() => useDashboard())

    expect(result.current).toMatchObject({ status: 'ready', sets: [] })
  })

  it.each([
    ['the sets', { sets: { isPending: false, error: new Error('boom') } }],
    ['the notes', { notes: { isPending: false, error: new Error('boom') } }],
    ['a set', { details: [{ isPending: false, error: new Error('boom') }] }],
  ])('is in error when %s fail', (_name, state) => {
    queries(state)

    expect(renderHook(() => useDashboard()).result.current.status).toBe('error')
  })

  it('retries only the queries that failed', () => {
    const setsRefetch = vi.fn()
    const notesRefetch = vi.fn()
    const failedRefetch = vi.fn()
    const okRefetch = vi.fn()
    queries({
      sets: { isPending: false, error: new Error('boom'), refetch: setsRefetch },
      notes: { isPending: false, error: new Error('boom'), refetch: notesRefetch },
      details: [
        { isPending: false, error: new Error('boom'), refetch: failedRefetch },
        { isPending: false, data: detail, refetch: okRefetch },
      ],
    })

    renderHook(() => useDashboard()).result.current.retry()

    expect(setsRefetch).toHaveBeenCalledOnce()
    expect(notesRefetch).toHaveBeenCalledOnce()
    expect(failedRefetch).toHaveBeenCalledOnce()
    expect(okRefetch).not.toHaveBeenCalled()
  })

  it('refetches nothing on retry when nothing failed', () => {
    const refetch = vi.fn()
    queries({
      sets: { isPending: false, data: setList, refetch },
      notes: { isPending: false, data: notes, refetch },
      details: [{ isPending: false, data: detail, refetch }],
    })

    renderHook(() => useDashboard()).result.current.retry()

    expect(refetch).not.toHaveBeenCalled()
  })
})
