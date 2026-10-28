import { renderHook } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import {
  listNotesOptions,
  listSetsOptions,
  listTagColorsOptions,
} from '@md-viz/api-client/cache/react-query'
import { useDashboard } from '../../src/hooks/use-dashboard'

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }))
vi.mock('@md-viz/api-client/cache/react-query', () => ({
  listNotesOptions: vi.fn(() => ({ queryKey: ['notes'] })),
  listSetsOptions: vi.fn(() => ({ queryKey: ['sets'] })),
  listTagColorsOptions: vi.fn(() => ({ queryKey: ['tag-colors'] })),
}))

type Result = Record<string, unknown>

/** each query answers by its key: the notes, the sets or the tag colours. */
function queriesReturn(notes: Result, sets: Result, tagColors: Result = loaded.tagColors) {
  const byKey: Record<string, Result> = { notes, sets, 'tag-colors': tagColors }
  vi.mocked(useQuery).mockImplementation(
    ((options: { queryKey: string[] }) =>
      byKey[options.queryKey[0]] as unknown as UseQueryResult) as typeof useQuery,
  )
}

const loaded = {
  notes: { isPending: false, data: [{ id: 'a', fields: { title: 'plan' } }] },
  sets: { isPending: false, data: [{ id: 'bear:modified-today', count: 1 }] },
  tagColors: { isPending: false, data: { tags: [{ tag: 'work', color: 3 }] } },
}

describe('useDashboard', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('asks the cache for the note titles and tags, the sets and the tag colours', () => {
    queriesReturn(loaded.notes, loaded.sets)
    renderHook(() => useDashboard())

    expect(listNotesOptions).toHaveBeenCalledWith({ query: { fields: 'title,tags' } })
    expect(listSetsOptions).toHaveBeenCalled()
    expect(listTagColorsOptions).toHaveBeenCalled()
  })

  it('is pending while either query loads', () => {
    queriesReturn({ isPending: true }, loaded.sets)
    expect(renderHook(() => useDashboard()).result.current.status).toBe('pending')

    queriesReturn(loaded.notes, { isPending: true })
    expect(renderHook(() => useDashboard()).result.current.status).toBe('pending')

    queriesReturn(loaded.notes, loaded.sets, { isPending: true })
    expect(renderHook(() => useDashboard()).result.current.status).toBe('pending')
  })

  it('is ready with titled notes and the sets of the source', () => {
    queriesReturn(
      {
        isPending: false,
        data: [
          { id: 'a', fields: { title: 'plan', tags: '["work","other"]' } },
          { id: 'untitled', fields: {} },
        ],
      },
      loaded.sets,
    )
    const { result } = renderHook(() => useDashboard())

    expect(result.current.status).toBe('ready')
    expect(result.current.notes).toEqual([
      { id: 'a', title: 'plan', colors: [3], tags: ['work', 'other'] },
      { id: 'untitled', title: 'untitled', colors: [], tags: [] },
    ])
    expect(result.current.sets).toEqual([
      { id: 'bear:modified-today', label: 'modified today', count: 1 },
    ])
  })

  it('has no notes or sets for an empty cache', () => {
    queriesReturn({ isPending: false, data: [] }, { isPending: false, data: [] })
    const { result } = renderHook(() => useDashboard())

    expect(result.current).toMatchObject({ status: 'ready', notes: [], sets: [] })
  })

  it('is in error when either query fails, and retry refetches only the failed one', () => {
    const refetchNotes = vi.fn()
    const refetchSets = vi.fn()
    queriesReturn(
      { isPending: false, error: new Error('boom'), refetch: refetchNotes },
      { isPending: false, data: [], refetch: refetchSets },
    )
    const { result } = renderHook(() => useDashboard())
    result.current.retry()

    expect(result.current.status).toBe('error')
    expect(refetchNotes).toHaveBeenCalledOnce()
    expect(refetchSets).not.toHaveBeenCalled()
  })

  it('retries the sets query when it is the one that failed', () => {
    const refetchNotes = vi.fn()
    const refetchSets = vi.fn()
    queriesReturn(
      { isPending: false, data: [], refetch: refetchNotes },
      { isPending: false, error: new Error('boom'), refetch: refetchSets },
    )
    const { result } = renderHook(() => useDashboard())
    result.current.retry()

    expect(result.current.status).toBe('error')
    expect(refetchSets).toHaveBeenCalledOnce()
    expect(refetchNotes).not.toHaveBeenCalled()
  })

  it('has no colours while the tag colours are not loaded', () => {
    queriesReturn(
      { isPending: false, data: [{ id: 'a', fields: { title: 'plan', tags: '["work"]' } }] },
      loaded.sets,
      { isPending: true },
    )
    const { result } = renderHook(() => useDashboard())

    expect(result.current.notes).toEqual([{ id: 'a', title: 'plan', colors: [], tags: ['work'] }])
  })

  it('is in error when the tag colours fail, and retries only that query', () => {
    const refetchColors = vi.fn()
    const refetchNotes = vi.fn()
    queriesReturn({ isPending: false, data: [], refetch: refetchNotes }, loaded.sets, {
      isPending: false,
      error: new Error('boom'),
      refetch: refetchColors,
    })
    const { result } = renderHook(() => useDashboard())
    result.current.retry()

    expect(result.current.status).toBe('error')
    expect(refetchColors).toHaveBeenCalledOnce()
    expect(refetchNotes).not.toHaveBeenCalled()
  })
})
