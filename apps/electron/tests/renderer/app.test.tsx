import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Api, LastSelection, LastSync, SyncTarget } from '../../src/shared/ipc'
import { App } from '../../src/renderer/src/app'
import { useScan } from '../../src/renderer/src/hooks/use-scan'
import { useSync } from '../../src/renderer/src/hooks/use-sync'

vi.mock('../../src/renderer/src/hooks/use-scan', () => ({ useScan: vi.fn() }))
vi.mock('../../src/renderer/src/hooks/use-sync', () => ({ useSync: vi.fn() }))

const scan = vi.fn()
const reset = vi.fn()
const file: SyncTarget = { source: 'file', folder: '/notes' }
const sync = vi.fn()

const lastSync: LastSync = {
  syncedAt: '2026-10-20T09:30:00.000Z',
  notes: { updated: [], deleted: [], unchanged: [{ id: 'k1', title: 'same idea' }] },
}

const clear = vi.fn()
const idleScan = { target: null, progress: null, count: null, scanning: false, scan, clear }
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
    loadLast: vi.fn().mockResolvedValue({ source: 'file', folder: null, lastSync: null }),
    selectSource: vi.fn(),
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
    expect(scan).toHaveBeenCalledWith(file)
  })

  it('does nothing when the dialog is cancelled', async () => {
    const api = stubApi({ pickFolder: vi.fn().mockResolvedValue(null) })
    render(<App />)
    // launching with nothing saved resets the sync; only what the dialog does is checked.
    await vi.waitFor(() => expect(api.loadLast).toHaveBeenCalled())
    reset.mockClear()

    await userEvent.click(screen.getByRole('button', { name: 'choose folder' }))

    expect(scan).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
  })

  it('reopens the saved folder with its last sync', async () => {
    const last: LastSelection = { source: 'file', folder: '/saved', lastSync }
    stubApi({ loadLast: vi.fn().mockResolvedValue(last) })
    render(<App />)

    await vi.waitFor(() => expect(scan).toHaveBeenCalledWith({ source: 'file', folder: '/saved' }))
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

    mockHooks({ scanState: { target: file } })
    rerender(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'sync' }))

    expect(sync).toHaveBeenCalledOnce()
  })

  it.each([
    ['scanning', { scanState: { target: file, scanning: true } }],
    ['syncing', { scanState: { target: file }, syncState: { syncing: true } }],
  ])('disables both buttons while %s', (_, state) => {
    mockHooks(state)
    render(<App />)

    expect(screen.getByRole('button', { name: 'choose folder' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'sync' })).toBeDisabled()
  })

  it('shows the chosen folder only once there is one', () => {
    const { rerender } = render(<App />)
    expect(screen.queryByLabelText('chosen source')).not.toBeInTheDocument()

    mockHooks({ scanState: { target: file, count: 18 } })
    rerender(<App />)

    expect(screen.getByLabelText('chosen source')).toHaveTextContent('/notes')
    expect(screen.getByText('18 notes')).toBeInTheDocument()
  })

  it('shows the note grids of the last sync under the folder card, which is as wide as they are', () => {
    mockHooks({ scanState: { target: file }, syncState: { lastSync } })
    render(<App />)

    const card = screen.getByLabelText('chosen source').parentElement
    expect(screen.getByRole('region', { name: 'unchanged' })).toHaveTextContent('1')
    expect(card).toHaveClass('w-full')
    expect(card?.parentElement).toContainElement(screen.getByRole('region', { name: 'unchanged' }))
  })

  it('makes the header as wide as the status grids while they are shown', () => {
    const { rerender } = render(<App />)
    expect(screen.getByRole('banner').style.width).toBe('')

    mockHooks({ scanState: { target: file }, syncState: { lastSync } })
    rerender(<App />)
    expect(screen.getByRole('banner').style.width).toMatch(/^\d+px$/)

    mockHooks({ scanState: { target: file } })
    rerender(<App />)
    expect(screen.getByRole('banner').style.width).toBe('')
  })

  it('keeps the folder card at its own width until there is a sync', () => {
    mockHooks({ scanState: { target: file } })
    render(<App />)

    expect(screen.getByLabelText('chosen source').parentElement).not.toHaveClass('w-full')
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

  describe('source', () => {
    const pick = async (source: string) => {
      await userEvent.click(screen.getByRole('combobox', { name: 'source' }))
      await userEvent.click(screen.getByRole('option', { name: source }))
    }

    it('starts on files, with the folder button', () => {
      render(<App />)

      expect(screen.getByRole('combobox', { name: 'source' })).toHaveTextContent('file')
      expect(screen.getByRole('button', { name: 'choose folder' })).toBeInTheDocument()
    })

    it('opens Bear with its last sync and hides the folder button', async () => {
      const api = stubApi({
        selectSource: vi.fn().mockResolvedValue({ source: 'bear', folder: null, lastSync }),
      })
      render(<App />)

      await pick('bear')

      expect(api.selectSource).toHaveBeenCalledWith('bear')
      expect(reset).toHaveBeenCalledWith(lastSync)
      expect(scan).toHaveBeenCalledWith({ source: 'bear' })
      expect(screen.queryByRole('button', { name: 'choose folder' })).not.toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: 'source' })).toHaveTextContent('bear')
    })

    it('goes back to the folder remembered for files, with its sync', async () => {
      stubApi({
        loadLast: vi.fn().mockResolvedValue({ source: 'bear', folder: null, lastSync: null }),
        selectSource: vi.fn().mockResolvedValue({ source: 'file', folder: '/saved', lastSync }),
      })
      render(<App />)
      await vi.waitFor(() => expect(scan).toHaveBeenCalledWith({ source: 'bear' }))

      await pick('file')

      expect(scan).toHaveBeenLastCalledWith({ source: 'file', folder: '/saved' })
      expect(reset).toHaveBeenLastCalledWith(lastSync)
      expect(screen.getByRole('button', { name: 'choose folder' })).toBeInTheDocument()
    })

    it('shows nothing for files until a folder is chosen', async () => {
      stubApi({
        loadLast: vi.fn().mockResolvedValue({ source: 'bear', folder: null, lastSync: null }),
        selectSource: vi.fn().mockResolvedValue({ source: 'file', folder: null, lastSync: null }),
      })
      render(<App />)
      await vi.waitFor(() => expect(scan).toHaveBeenCalledWith({ source: 'bear' }))
      scan.mockClear()
      clear.mockClear()

      await pick('file')

      expect(clear).toHaveBeenCalledOnce()
      expect(reset).toHaveBeenLastCalledWith(null)
      expect(scan).not.toHaveBeenCalled()
    })

    it('reopens Bear on launch when it was the last source', async () => {
      stubApi({
        loadLast: vi.fn().mockResolvedValue({ source: 'bear', folder: null, lastSync }),
      })
      render(<App />)

      await vi.waitFor(() => expect(scan).toHaveBeenCalledWith({ source: 'bear' }))
      expect(reset).toHaveBeenCalledWith(lastSync)
      expect(screen.getByRole('combobox', { name: 'source' })).toHaveTextContent('bear')
    })

    it('does nothing when the source picked is already selected', async () => {
      const api = stubApi()
      render(<App />)

      await pick('file')

      expect(api.selectSource).not.toHaveBeenCalled()
    })

    it('shows the error when the source cannot be selected', async () => {
      stubApi({ selectSource: vi.fn().mockRejectedValue(new Error('state is unreadable')) })
      render(<App />)

      await pick('bear')

      expect(await screen.findByRole('alert')).toHaveTextContent('state is unreadable')
    })

    it('disables the source select while scanning or syncing', () => {
      mockHooks({ scanState: { target: file, scanning: true } })
      render(<App />)

      expect(screen.getByRole('combobox', { name: 'source' })).toBeDisabled()
    })
  })
})
