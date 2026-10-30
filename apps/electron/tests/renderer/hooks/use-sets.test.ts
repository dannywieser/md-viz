import { renderHook, waitFor } from '@testing-library/react'
import type { Api, NoteSet } from '../../../src/shared/ipc'
import { useSets } from '../../../src/renderer/src/hooks/use-sets'

const unchanged: NoteSet = {
  id: 'unchanged',
  name: 'unchanged',
  color: 0,
  notes: [{ id: 'a', title: 'plan' }],
}
const created: NoteSet = { id: 'created-today', name: 'created-today', color: 3, notes: [] }

function stubApi(sets: Api['sets']) {
  window.api = { sets } as unknown as Api
  return sets
}

describe('useSets', () => {
  const onError = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads the sets of the source and returns null until then', async () => {
    const sets = stubApi(vi.fn().mockResolvedValue([unchanged]))
    const { result } = renderHook(() => useSets('bear', undefined, true, onError))

    expect(result.current).toBeNull()
    await waitFor(() => expect(result.current).toEqual([unchanged]))
    expect(sets).toHaveBeenCalledWith('bear')
  })

  it('loads nothing while it is not enabled', () => {
    const sets = stubApi(vi.fn().mockResolvedValue([unchanged]))
    const { result } = renderHook(() => useSets('bear', undefined, false, onError))

    expect(sets).not.toHaveBeenCalled()
    expect(result.current).toBeNull()
  })

  it('loads again when a sync completes', async () => {
    const sets = stubApi(
      vi.fn().mockResolvedValueOnce([unchanged]).mockResolvedValueOnce([created]),
    )
    const { result, rerender } = renderHook(
      ({ syncedAt }) => useSets('bear', syncedAt, true, onError),
      { initialProps: { syncedAt: '2026-10-30T10:00:00.000Z' } },
    )
    await waitFor(() => expect(result.current).toEqual([unchanged]))

    rerender({ syncedAt: '2026-10-30T11:00:00.000Z' })

    await waitFor(() => expect(result.current).toEqual([created]))
    expect(sets).toHaveBeenCalledTimes(2)
  })

  it("hides one source's sets while the other's load", async () => {
    let finish: (sets: NoteSet[]) => void = () => {}
    stubApi(
      vi
        .fn()
        .mockResolvedValueOnce([unchanged])
        .mockReturnValueOnce(new Promise<NoteSet[]>((resolve) => (finish = resolve))),
    )
    const { result, rerender } = renderHook(
      ({ source }: { source: 'bear' | 'file' }) => useSets(source, undefined, true, onError),
      { initialProps: { source: 'bear' } },
    )
    await waitFor(() => expect(result.current).toEqual([unchanged]))

    rerender({ source: 'file' })

    expect(result.current).toBeNull()
    finish([created])
    await waitFor(() => expect(result.current).toEqual([created]))
  })

  it('ignores an answer that arrives after the source changed', async () => {
    let late: (sets: NoteSet[]) => void = () => {}
    stubApi(
      vi
        .fn()
        .mockReturnValueOnce(new Promise<NoteSet[]>((resolve) => (late = resolve)))
        .mockResolvedValueOnce([created]),
    )
    const { result, rerender } = renderHook(
      ({ source }: { source: 'bear' | 'file' }) => useSets(source, undefined, true, onError),
      { initialProps: { source: 'bear' } },
    )

    rerender({ source: 'file' })
    await waitFor(() => expect(result.current).toEqual([created]))
    late([unchanged])
    await Promise.resolve()

    expect(result.current).toEqual([created])
  })

  it('reports an error and keeps showing nothing', async () => {
    stubApi(vi.fn().mockRejectedValue(new Error('cache is down')))
    const { result } = renderHook(() => useSets('bear', undefined, true, onError))

    await waitFor(() => expect(onError).toHaveBeenCalledWith('cache is down'))
    expect(result.current).toBeNull()
  })

  it('does not report an error that arrives after the source changed', async () => {
    let fail: (error: Error) => void = () => {}
    stubApi(
      vi
        .fn()
        .mockReturnValueOnce(new Promise<NoteSet[]>((_, reject) => (fail = reject)))
        .mockResolvedValueOnce([created]),
    )
    const { rerender } = renderHook(
      ({ source }: { source: 'bear' | 'file' }) => useSets(source, undefined, true, onError),
      { initialProps: { source: 'bear' } },
    )

    rerender({ source: 'file' })
    fail(new Error('late'))
    await Promise.resolve()
    await Promise.resolve()

    expect(onError).not.toHaveBeenCalled()
  })
})
