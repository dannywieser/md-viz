import { act, render, screen, waitFor, within } from '@testing-library/react'
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
  notes: { updated: [], deleted: [], unchanged: [{ id: 'k1', title: 'same idea', tags: [] }] },
  tagColors: {},
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

// jsdom lacks the pointer and scroll APIs radix select uses.
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => undefined
  Element.prototype.releasePointerCapture = () => undefined
  Element.prototype.scrollIntoView = () => undefined
})

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
    localStorage.clear()
    document.documentElement.removeAttribute('style')
    document.documentElement.removeAttribute('data-theme')
  })

  it('renders the app header with the sync title and a choose-folder button', () => {
    render(<App />)

    expect(screen.getByRole('banner')).toHaveTextContent('md-viz sync')
    expect(screen.getByRole('button', { name: 'choose folder' })).toBeEnabled()
  })

  it('has a theme switcher in the header, on solarized, that applies the theme picked', async () => {
    render(<App />)
    const picker = within(screen.getByRole('banner')).getByRole('combobox', { name: 'theme' })
    expect(picker).toHaveTextContent('solarized')

    await userEvent.click(picker)
    await userEvent.click(screen.getByRole('option', { name: 'dracula' }))

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dracula'))
    expect(screen.getByRole('combobox', { name: 'theme' })).toHaveTextContent('dracula')
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

  it('shows the note grids of the last sync under the one-line folder card', () => {
    mockHooks({ scanState: { target: file }, syncState: { lastSync } })
    render(<App />)

    expect(screen.getByRole('region', { name: 'unchanged' })).toHaveTextContent('1')
    expect(screen.getAllByRole('region')).toHaveLength(3)
    expect(screen.getByLabelText('chosen source')).toBeInTheDocument()
  })

  it('shows empty grids for a source that has not been synced', () => {
    mockHooks({ scanState: { target: file } })
    render(<App />)

    expect(screen.getAllByRole('region')).toHaveLength(3)
    expect(screen.getByText(/never synced/)).toBeInTheDocument()
  })

  it('shows no grids until a source is chosen', () => {
    render(<App />)

    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })

  it('shows the scan progress over the grids while scanning', () => {
    mockHooks({
      scanState: { target: file, scanning: true, progress: { dirs: 2, mdFiles: 5 } },
    })
    render(<App />)

    expect(screen.getByRole('dialog', { name: 'scanning' })).toBeInTheDocument()
    expect(screen.getByText('2 folders, 5 notes so far')).toBeInTheDocument()
  })

  it('shows the sync progress over the grids while syncing', () => {
    mockHooks({
      scanState: { target: file },
      syncState: { lastSync, syncing: true, progress: { synced: 1, deleted: 0, total: 4 } },
    })
    render(<App />)

    expect(screen.getByRole('dialog', { name: 'syncing' })).toBeInTheDocument()
    expect(screen.getByText('1 pushed, 0 deleted of 4')).toBeInTheDocument()
    expect(screen.getAllByRole('region')).toHaveLength(3)
  })

  it('shows no overlay while idle', () => {
    mockHooks({ scanState: { target: file }, syncState: { lastSync } })
    render(<App />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the error in place of the grids', () => {
    mockHooks({ scanState: { target: file }, syncState: { lastSync } })
    render(<App />)
    act(() => vi.mocked(useScan).mock.lastCall![0]('cache is down'))

    expect(screen.getByRole('alert')).toHaveTextContent('cache is down')
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
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
