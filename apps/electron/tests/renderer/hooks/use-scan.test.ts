import { act, renderHook } from '@testing-library/react'
import type { Api, ScanProgress, ScanResult, SyncTarget } from '../../../src/shared/ipc'
import { useScan } from '../../../src/renderer/src/hooks/use-scan'

const notes: SyncTarget = { source: 'file', folder: '/notes' }
const other: SyncTarget = { source: 'file', folder: '/other' }

function stubApi(scanFolder: Api['scan']) {
  const unsubscribe = vi.fn()
  let push: (progress: ScanProgress) => void = () => {}
  window.api = {
    scan: scanFolder,
    onScanProgress: vi.fn((callback: (progress: ScanProgress) => void) => {
      push = callback
      return unsubscribe
    }),
  } as unknown as Api
  return { unsubscribe, push: (progress: ScanProgress) => push(progress) }
}

describe('useScan', () => {
  it('starts with nothing chosen', () => {
    const { result } = renderHook(() => useScan(vi.fn()))

    expect(result.current).toMatchObject({
      target: null,
      progress: null,
      count: null,
      scanning: false,
    })
  })

  it('scans the folder and keeps its note count', async () => {
    const { unsubscribe } = stubApi(vi.fn().mockResolvedValue({ count: 18 }))
    const onError = vi.fn()
    const { result } = renderHook(() => useScan(onError))

    await act(() => result.current.scan(notes))

    expect(window.api.scan).toHaveBeenCalledWith(notes)
    expect(result.current).toMatchObject({ target: notes, count: 18, scanning: false })
    expect(onError).toHaveBeenCalledExactlyOnceWith(null)
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('reports progress while scanning, then stops listening', async () => {
    let finish: (value: ScanResult) => void = () => {}
    const { push, unsubscribe } = stubApi(
      vi.fn(() => new Promise<ScanResult>((resolve) => (finish = resolve))),
    )
    const { result } = renderHook(() => useScan(vi.fn()))

    let scanning: Promise<void> = Promise.resolve()
    act(() => {
      scanning = result.current.scan(notes)
    })
    act(() => push({ dirs: 3, mdFiles: 7 }))
    expect(result.current).toMatchObject({ scanning: true, progress: { dirs: 3, mdFiles: 7 } })

    await act(async () => {
      finish({ count: 7 })
      await scanning
    })
    expect(result.current.scanning).toBe(false)
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('forgets the previous count when scanning another folder', async () => {
    stubApi(
      vi
        .fn()
        .mockResolvedValueOnce({ count: 18 })
        .mockReturnValueOnce(new Promise(() => {})),
    )
    const { result } = renderHook(() => useScan(vi.fn()))
    await act(() => result.current.scan(notes))

    act(() => void result.current.scan(other))

    expect(result.current).toMatchObject({ target: other, count: null, progress: null })
  })

  it('reports the message of a failed scan', async () => {
    const { unsubscribe } = stubApi(vi.fn().mockRejectedValue(new Error('Not a directory')))
    const onError = vi.fn()
    const { result } = renderHook(() => useScan(onError))

    await act(() => result.current.scan(notes))

    expect(onError).toHaveBeenLastCalledWith('Not a directory')
    expect(result.current).toMatchObject({ count: null, scanning: false })
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('scans Bear, which has no folder', async () => {
    stubApi(vi.fn().mockResolvedValue({ count: 4845 }))
    const { result } = renderHook(() => useScan(vi.fn()))

    await act(() => result.current.scan({ source: 'bear' }))

    expect(window.api.scan).toHaveBeenCalledWith({ source: 'bear' })
    expect(result.current).toMatchObject({ target: { source: 'bear' }, count: 4845 })
  })

  it('clears the chosen source, its count and its progress', async () => {
    stubApi(vi.fn().mockResolvedValue({ count: 18 }))
    const { result } = renderHook(() => useScan(vi.fn()))
    await act(() => result.current.scan(notes))

    act(() => result.current.clear())

    expect(result.current).toMatchObject({ target: null, count: null, progress: null })
  })
})
