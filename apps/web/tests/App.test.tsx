import { fireEvent, render as rtlRender, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { configureCacheClient } from '@md-viz/api-client/cache'
import { App } from '../src/App'

function render(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return rtlRender(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

function respondWith(body: string, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(body, { status, headers: { 'content-type': 'application/json' } }),
      ),
    ),
  )
}

describe('App', () => {
  beforeEach(() => {
    configureCacheClient({ baseUrl: 'http://cache.test' })
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders the app header', () => {
    respondWith('[]')
    render(<App />)

    expect(screen.getByRole('banner')).toHaveTextContent('md-viz')
  })

  it('shows a loading message until the cache answers', () => {
    respondWith('[]')
    render(<App />)

    expect(screen.getByText('loading notes')).toBeInTheDocument()
  })

  it('shows one cell per cached note in a card hugging the grid', async () => {
    respondWith(
      '[{"id":"a","fields":{"title":"plan"}},{"id":"b","fields":{"title":"plants"}},{"id":"c","fields":{}}]',
    )
    const { container } = render(<App />)

    expect(await screen.findByRole('img', { name: '3 notes' })).toBeInTheDocument()
    expect(container.querySelectorAll('.note-square')).toHaveLength(3)
    expect(container.querySelector('[data-slot="note-grid"] [data-slot="card"] svg')).not.toBeNull()
    const request = vi.mocked(fetch).mock.calls[0][0] as Request
    expect(request.url).toContain('/notes?fields=title')
  })

  it('shows the title of the hovered note, falling back to its id', async () => {
    respondWith('[{"id":"a","fields":{"title":"plan"}},{"id":"untitled","fields":{}}]')
    render(<App />)
    const grid = await screen.findByRole('img', { name: '2 notes' })
    vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100))

    fireEvent.pointerMove(grid, { clientX: 2, clientY: 2 })
    expect(screen.getByRole('tooltip')).toHaveTextContent('plan')

    const cell = Number(grid.querySelector('.note-square')?.getAttribute('width'))
    fireEvent.pointerMove(grid, { clientX: 1.5 + cell * 1.5, clientY: 2 })
    expect(screen.getByRole('tooltip')).toHaveTextContent('untitled')
  })

  it('says so when the cache has no notes', async () => {
    respondWith('[]')
    render(<App />)

    expect(await screen.findByText('no notes in the cache')).toBeInTheDocument()
  })

  it('says so when the cache cannot be read', async () => {
    respondWith('{"error":"boom"}', 500)
    render(<App />)

    expect(await screen.findByText('could not load notes from the cache')).toBeInTheDocument()
  })
})
