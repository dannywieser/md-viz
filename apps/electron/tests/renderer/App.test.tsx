import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type {
  Api,
  LastFolder,
  ScanProgress,
  ScanResult,
  SyncProgress,
  SyncResult,
} from '../../src/shared/ipc'
import { App } from '../../src/renderer/src/App'

function stubApi(overrides: Partial<Api> = {}) {
  const unsubscribe = vi.fn()
  let pushProgress: (progress: ScanProgress) => void = () => {}
  let pushSync: (progress: SyncProgress) => void = () => {}
  const api: Api = {
    pickFolder: vi.fn().mockResolvedValue('/notes'),
    scanFolder: vi.fn().mockResolvedValue({ mdCount: 18 }),
    onScanProgress: vi.fn((callback: (progress: ScanProgress) => void) => {
      pushProgress = callback
      return unsubscribe
    }),
    syncFolder: vi.fn().mockResolvedValue({
      scanned: 18,
      synced: 5,
      unchanged: 13,
      deleted: 2,
      failed: 0,
      notes: {
        updated: [{ id: 'u1', title: 'new idea' }],
        deleted: [{ id: 'd1', title: 'old idea' }],
        unchanged: [{ id: 'k1', title: 'same idea' }],
      },
    } satisfies SyncResult),
    loadLast: vi.fn().mockResolvedValue(null),
    onSyncProgress: vi.fn((callback: (progress: SyncProgress) => void) => {
      pushSync = callback
      return unsubscribe
    }),
    ...overrides,
  }
  window.api = api
  return {
    api,
    unsubscribe,
    push: (p: ScanProgress) => pushProgress(p),
    pushSync: (p: SyncProgress) => pushSync(p),
  }
}

describe('App', () => {
  beforeEach(() => {
    // jsdom has no layout; the note grids only draw once their container has a size.
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(288)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(160)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the app header and a choose-folder button', () => {
    stubApi()
    render(<App />)

    expect(screen.getByRole('banner')).toHaveTextContent('md-viz')
    expect(screen.getByRole('button', { name: 'choose folder' })).toBeEnabled()
  })

  it('picks a folder, scans it and shows the note count', async () => {
    const { api, unsubscribe } = stubApi()
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'choose folder' }))

    expect(await screen.findByText('18 notes')).toBeInTheDocument()
    expect(screen.getByLabelText('chosen folder')).toHaveTextContent('/notes')
    expect(api.scanFolder).toHaveBeenCalledWith('/notes')
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('shows progress while the scan is running', async () => {
    let finish: (value: ScanResult) => void = () => {}
    const { push } = stubApi({
      scanFolder: vi.fn(() => new Promise<ScanResult>((resolve) => (finish = resolve))),
    })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'choose folder' }))
    push({ dirs: 3, mdFiles: 7 })

    expect(await screen.findByText(/3 folders, 7 notes so far/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'choose folder' })).toBeDisabled()

    finish({ mdCount: 7 })
    expect(await screen.findByText('7 notes')).toBeInTheDocument()
    expect(screen.queryByText(/so far/)).not.toBeInTheDocument()
  })

  it('does nothing when the dialog is cancelled', async () => {
    const { api } = stubApi({ pickFolder: vi.fn().mockResolvedValue(null) })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'choose folder' }))

    expect(api.scanFolder).not.toHaveBeenCalled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows an error when the scan fails', async () => {
    stubApi({ scanFolder: vi.fn().mockRejectedValue(new Error('Not a directory')) })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'choose folder' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('not a directory')
    expect(screen.getByRole('button', { name: 'choose folder' })).toBeEnabled()
  })

  it('keeps sync disabled until a folder is chosen', () => {
    stubApi()
    render(<App />)

    expect(screen.getByRole('button', { name: 'sync' })).toBeDisabled()
  })

  it('syncs the chosen folder and shows the result', async () => {
    const { api } = stubApi()
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'choose folder' }))
    await screen.findByText('18 notes')
    await userEvent.click(screen.getByRole('button', { name: 'sync' }))

    expect(await screen.findByRole('region', { name: 'updated' })).toBeInTheDocument()
    expect(api.syncFolder).toHaveBeenCalledWith('/notes')
  })

  it('shows progress while syncing', async () => {
    let finish: (value: SyncResult) => void = () => {}
    const { pushSync } = stubApi({
      syncFolder: vi.fn(() => new Promise<SyncResult>((resolve) => (finish = resolve))),
    })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'choose folder' }))
    await screen.findByText('18 notes')
    await userEvent.click(screen.getByRole('button', { name: 'sync' }))
    pushSync({ synced: 3, deleted: 1, total: 8 })

    expect(await screen.findByText(/3 pushed, 1 deleted of 8/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'sync' })).toBeDisabled()

    finish({
      scanned: 8,
      synced: 8,
      unchanged: 0,
      deleted: 0,
      failed: 1,
      notes: { updated: [], deleted: [], unchanged: [] },
    })
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'sync' })).toBeEnabled())
    expect(screen.queryByText(/3 pushed/)).not.toBeInTheDocument()
  })

  it('shows an error when the sync fails', async () => {
    stubApi({ syncFolder: vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED')) })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'choose folder' }))
    await screen.findByText('18 notes')
    await userEvent.click(screen.getByRole('button', { name: 'sync' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('connect econnrefused')
    expect(screen.getByRole('button', { name: 'sync' })).toBeEnabled()
  })

  it('shows the three note grids with counts after a sync', async () => {
    stubApi()
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'choose folder' }))
    await screen.findByText('18 notes')
    expect(screen.getByText('never synced')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'sync' }))

    for (const label of ['updated', 'deleted', 'unchanged']) {
      expect(await screen.findByRole('region', { name: label })).toHaveTextContent('1')
    }
    expect(screen.getByText(/last synced/)).toBeInTheDocument()
  })

  it('reopens the saved folder, scans it and shows its last sync', async () => {
    const last: LastFolder = {
      folder: '/saved',
      lastSync: {
        syncedAt: '2026-10-20T09:30:00.000Z',
        notes: { updated: [], deleted: [], unchanged: [{ id: 'k1', title: 'same idea' }] },
      },
    }
    const { api } = stubApi({ loadLast: vi.fn().mockResolvedValue(last) })
    render(<App />)

    expect(await screen.findByText('18 notes')).toBeInTheDocument()
    expect(api.scanFolder).toHaveBeenCalledWith('/saved')
    expect(screen.getByLabelText('chosen folder')).toHaveTextContent('/saved')
    expect(screen.getByText(/last synced/)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'unchanged' })).toHaveTextContent('1')
    expect(screen.getByRole('region', { name: 'updated' })).toHaveTextContent('no notes')
  })

  it('starts with no folder when there is nothing saved', async () => {
    const { api } = stubApi()
    render(<App />)

    await vi.waitFor(() => expect(api.loadLast).toHaveBeenCalled())
    expect(api.scanFolder).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('chosen folder')).not.toBeInTheDocument()
  })
})
