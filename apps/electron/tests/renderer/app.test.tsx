import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Api, LastFolder, LastSync } from '../../src/shared/ipc'
import { App } from '../../src/renderer/src/app'
import { useScan } from '../../src/renderer/src/hooks/use-scan'
import { useSync } from '../../src/renderer/src/hooks/use-sync'

vi.mock('../../src/renderer/src/hooks/use-scan', () => ({ useScan: vi.fn() }))
vi.mock('../../src/renderer/src/hooks/use-sync', () => ({ useSync: vi.fn() }))

const scan = vi.fn()
const reset = vi.fn()
const sync = vi.fn()

const lastSync: LastSync = {
  syncedAt: '2026-10-20T09:30:00.000Z',
  notes: { updated: [], deleted: [], unchanged: [{ id: 'k1', title: 'same idea' }] },
}

const idleScan = { folder: null, progress: null, count: null, scanning: false, scan }
const idleSync = { syncing: false, progress: null, lastSync: null, reset, sync }

function mockHooks({
  scanState = {},
  syncState = {},
}: { scanState?: object; syncState?: object } = {}) {
  vi.mocked(useScan).mockReturnValue({ ...idleScan, ...scanState })
  vi.mocked(useSync).mockReturnValue({ ...idleSync, ...syncState })
}

function stubApi(overrides: Partial<Api> = {}) {
  const api = {
    pickFolder: vi.fn().mockResolvedValue('/notes'),
    loadLast: vi.fn().mockResolvedValue(null),
    ...overrides,
  } as unknown as Api
  window.api = api
  return api
}

describe('App', () => {
  beforeEach(() => {
    // jsdom has no layout; the note grids only draw once their container has a size.
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(288)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(160)
    mockHooks()
    stubApi()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('renders the app header with the sync title and a choose-folder button', () => {
    render(<App />)

    expect(screen.getByRole('banner')).toHaveTextContent('md-viz sync')
    expect(screen.getByRole('button', { name: 'choose folder' })).toBeEnabled()
  })

  it('clears the last sync and scans the picked folder', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'choose folder' }))

    expect(reset).toHaveBeenCalledWith(null)
    expect(scan).toHaveBeenCalledWith('/notes')
  })

  it('does nothing when the dialog is cancelled', async () => {
    stubApi({ pickFolder: vi.fn().mockResolvedValue(null) })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'choose folder' }))

    expect(scan).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
  })

  it('reopens the saved folder with its last sync', async () => {
    const last: LastFolder = { folder: '/saved', lastSync }
    stubApi({ loadLast: vi.fn().mockResolvedValue(last) })
    render(<App />)

    await vi.waitFor(() => expect(scan).toHaveBeenCalledWith('/saved'))
    expect(reset).toHaveBeenCalledWith(lastSync)
  })

  it('starts with no folder when there is nothing saved', async () => {
    const api = stubApi()
    render(<App />)

    await vi.waitFor(() => expect(api.loadLast).toHaveBeenCalled())
    expect(scan).not.toHaveBeenCalled()
  })

  it('keeps sync disabled until a folder is chosen, then syncs it', async () => {
    const { rerender } = render(<App />)
    expect(screen.getByRole('button', { name: 'sync' })).toBeDisabled()

    mockHooks({ scanState: { folder: '/notes' } })
    rerender(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'sync' }))

    expect(sync).toHaveBeenCalledOnce()
  })

  it.each([
    ['scanning', { scanState: { folder: '/notes', scanning: true } }],
    ['syncing', { scanState: { folder: '/notes' }, syncState: { syncing: true } }],
  ])('disables both buttons while %s', (_, state) => {
    mockHooks(state)
    render(<App />)

    expect(screen.getByRole('button', { name: 'choose folder' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'sync' })).toBeDisabled()
  })

  it('shows the chosen folder only once there is one', () => {
    const { rerender } = render(<App />)
    expect(screen.queryByLabelText('chosen folder')).not.toBeInTheDocument()

    mockHooks({ scanState: { folder: '/notes', count: 18 } })
    rerender(<App />)

    expect(screen.getByLabelText('chosen folder')).toHaveTextContent('/notes')
    expect(screen.getByText('18 notes')).toBeInTheDocument()
  })

  it('shows the note grids of the last sync under the folder card, which is as wide as they are', () => {
    mockHooks({ scanState: { folder: '/notes' }, syncState: { lastSync } })
    render(<App />)

    const card = screen.getByLabelText('chosen folder').parentElement
    expect(screen.getByRole('region', { name: 'unchanged' })).toHaveTextContent('1')
    expect(card).toHaveClass('w-full')
    expect(card?.parentElement).toContainElement(screen.getByRole('region', { name: 'unchanged' }))
  })

  it('makes the header as wide as the status grids while they are shown', () => {
    const { rerender } = render(<App />)
    expect(screen.getByRole('banner').style.width).toBe('')

    mockHooks({ scanState: { folder: '/notes' }, syncState: { lastSync } })
    rerender(<App />)
    expect(screen.getByRole('banner').style.width).toMatch(/^\d+px$/)

    mockHooks({ scanState: { folder: '/notes' } })
    rerender(<App />)
    expect(screen.getByRole('banner').style.width).toBe('')
  })

  it('keeps the folder card at its own width until there is a sync', () => {
    mockHooks({ scanState: { folder: '/notes' } })
    render(<App />)

    expect(screen.getByLabelText('chosen folder').parentElement).not.toHaveClass('w-full')
  })

  it('shows an error reported by either hook, and clears it', () => {
    render(<App />)
    const onError = vi.mocked(useScan).mock.lastCall![0]
    expect(vi.mocked(useSync).mock.lastCall![1]).toBe(onError)

    act(() => onError('Not a directory'))
    expect(screen.getByRole('alert')).toHaveTextContent('not a directory')

    act(() => onError(null))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('leaves room for the traffic lights on macOS and the window buttons elsewhere', async () => {
    const header = () => screen.getByRole('banner')
    render(<App />)
    expect(header()).toHaveClass('pr-40')

    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Macintosh)')
    vi.resetModules()
    const { App: MacApp } = await import('../../src/renderer/src/app')
    const { useScan: freshScan } = await import('../../src/renderer/src/hooks/use-scan')
    const { useSync: freshSync } = await import('../../src/renderer/src/hooks/use-sync')
    vi.mocked(freshScan).mockReturnValue(idleScan)
    vi.mocked(freshSync).mockReturnValue(idleSync)
    document.body.innerHTML = ''
    render(<MacApp />)

    expect(header()).toHaveClass('pl-24')
  })
})
