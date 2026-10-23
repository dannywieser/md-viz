import { act, renderHook } from '@testing-library/react'
import type { Api, LastSync, SyncProgress, SyncResult } from '../../src/shared/ipc'
import { useSync } from '../../src/renderer/src/use-sync'

const notes = {
  updated: [{ id: 'u1', title: 'new idea' }],
  deleted: [],
  unchanged: [],
}
const result: SyncResult = { scanned: 1, synced: 1, unchanged: 0, deleted: 0, failed: 0, notes }

function stubApi(syncFolder: Api['syncFolder']) {
  const unsubscribe = vi.fn()
  let push: (progress: SyncProgress) => void = () => {}
  window.api = {
    syncFolder,
    onSyncProgress: vi.fn((callback: (progress: SyncProgress) => void) => {
      push = callback
      return unsubscribe
    }),
  } as unknown as Api
  return { unsubscribe, push: (progress: SyncProgress) => push(progress) }
}

describe('useSync', () => {
  it('starts with no sync', () => {
    const { result } = renderHook(() => useSync('/notes', vi.fn()))

    expect(result.current).toMatchObject({ syncing: false, progress: null, lastSync: null })
  })

  it('does nothing without a folder', async () => {
    stubApi(vi.fn())
    const { result } = renderHook(() => useSync(null, vi.fn()))

    await act(() => result.current.sync())

    expect(window.api.syncFolder).not.toHaveBeenCalled()
  })

  it('syncs the folder and keeps the notes with the time', async () => {
    const { unsubscribe } = stubApi(vi.fn().mockResolvedValue(result))
    const onError = vi.fn()
    const { result: hook } = renderHook(() => useSync('/notes', onError))

    await act(() => hook.current.sync())

    expect(window.api.syncFolder).toHaveBeenCalledWith('/notes')
    expect(hook.current.lastSync?.notes).toEqual(notes)
    expect(Date.parse(hook.current.lastSync!.syncedAt)).not.toBeNaN()
    expect(hook.current.syncing).toBe(false)
    expect(onError).toHaveBeenCalledExactlyOnceWith(null)
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('reports progress while syncing, then drops it', async () => {
    let finish: (value: SyncResult) => void = () => {}
    const { push } = stubApi(vi.fn(() => new Promise<SyncResult>((resolve) => (finish = resolve))))
    const { result: hook } = renderHook(() => useSync('/notes', vi.fn()))

    let syncing: Promise<void> = Promise.resolve()
    act(() => {
      syncing = hook.current.sync()
    })
    act(() => push({ synced: 3, deleted: 1, total: 8 }))
    expect(hook.current).toMatchObject({ syncing: true, progress: { synced: 3, total: 8 } })

    await act(async () => {
      finish(result)
      await syncing
    })
    expect(hook.current.syncing).toBe(false)
  })

  it('reports the message of a failed sync and keeps the previous sync', async () => {
    stubApi(vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED')))
    const onError = vi.fn()
    const { result: hook } = renderHook(() => useSync('/notes', onError))
    const saved: LastSync = { syncedAt: '2026-10-20T09:30:00.000Z', notes }
    act(() => hook.current.reset(saved))

    await act(() => hook.current.sync())

    expect(onError).toHaveBeenLastCalledWith('connect ECONNREFUSED')
    expect(hook.current).toMatchObject({ syncing: false, lastSync: saved })
  })

  it('resets to a saved sync and forgets the progress', () => {
    const { result: hook } = renderHook(() => useSync('/notes', vi.fn()))
    const saved: LastSync = { syncedAt: '2026-10-20T09:30:00.000Z', notes }

    act(() => hook.current.reset(saved))
    expect(hook.current.lastSync).toBe(saved)

    act(() => hook.current.reset(null))
    expect(hook.current).toMatchObject({ lastSync: null, progress: null })
  })
})
