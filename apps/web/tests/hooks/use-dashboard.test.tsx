import { renderHook } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { listNotesOptions } from '@md-viz/api-client/cache/react-query'
import { useDashboard } from '../../src/hooks/use-dashboard'

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }))
vi.mock('@md-viz/api-client/cache/react-query', () => ({
  listNotesOptions: vi.fn(() => ({ queryKey: ['notes'] })),
}))

function notesQueryReturns(result: Record<string, unknown>) {
  vi.mocked(useQuery).mockReturnValue(result as unknown as UseQueryResult)
}

describe('useDashboard', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('asks the cache for the note titles and tags', () => {
    notesQueryReturns({ isPending: false, data: [] })
    renderHook(() => useDashboard())

    expect(listNotesOptions).toHaveBeenCalledWith({ query: { fields: 'title,tags' } })
  })

  it('is pending while the notes load', () => {
    notesQueryReturns({ isPending: true })

    expect(renderHook(() => useDashboard()).result.current).toMatchObject({
      status: 'pending',
      notes: [],
    })
  })

  it('is ready with the notes as grid notes', () => {
    notesQueryReturns({
      isPending: false,
      data: [
        { id: 'a', fields: { title: 'plan', tags: '["work","other"]' } },
        { id: 'untitled', fields: {} },
      ],
    })
    const { result } = renderHook(() => useDashboard())

    expect(result.current.status).toBe('ready')
    expect(result.current.notes).toEqual([
      { id: 'a', title: 'plan', colors: [], tags: ['work', 'other'] },
      { id: 'untitled', title: 'untitled', colors: [], tags: [] },
    ])
  })

  it('is in error when the query fails, and retry refetches', () => {
    const refetch = vi.fn()
    notesQueryReturns({ isPending: false, error: new Error('boom'), refetch })
    const { result } = renderHook(() => useDashboard())
    result.current.retry()

    expect(result.current.status).toBe('error')
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('does not refetch on retry when nothing failed', () => {
    const refetch = vi.fn()
    notesQueryReturns({ isPending: false, data: [], refetch })
    renderHook(() => useDashboard()).result.current.retry()

    expect(refetch).not.toHaveBeenCalled()
  })
})
