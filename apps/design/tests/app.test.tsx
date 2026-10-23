import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../src/app'
import { useTheme } from '../src/theme'

vi.mock('../src/theme', () => ({ useTheme: vi.fn() }))
vi.mock('../src/board', () => ({ Board: () => <div>board page</div> }))
vi.mock('../src/explorations/explorations-index', () => ({
  ExplorationsIndex: () => <div>explorations index</div>,
}))
vi.mock('../src/explorations/exploration-page', () => ({
  ExplorationPage: ({ exploration }: { exploration: { slug: string } }) => (
    <div>exploration {exploration.slug}</div>
  ),
}))
vi.mock('../src/explorations/exploration-not-found', () => ({
  ExplorationNotFound: () => <div>exploration missing</div>,
}))

const toggle = vi.fn()

function renderAt(path: string, theme: 'light' | 'dark' = 'light') {
  window.history.pushState({}, '', path)
  vi.mocked(useTheme).mockReturnValue({ theme, toggle })
  return render(<App />)
}

describe('App', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/')
    vi.clearAllMocks()
  })

  it('shows the board at the root, with a link to the explorations', () => {
    renderAt('/')

    expect(screen.getByText('board page')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toHaveTextContent('design')
    expect(screen.getByRole('link', { name: 'explorations' })).toHaveAttribute(
      'href',
      '/explorations',
    )
  })

  it('shows the explorations index, with a link back to the board', () => {
    renderAt('/explorations')

    expect(screen.getByText('explorations index')).toBeInTheDocument()
    expect(screen.queryByText('board page')).toBeNull()
    expect(screen.getByRole('banner')).toHaveTextContent('explorations')
    expect(screen.getByRole('link', { name: 'board' })).toHaveAttribute('href', '/')
  })

  it('shows one exploration, titled in the header', () => {
    renderAt('/explorations/background')

    expect(screen.getByText('exploration background')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toHaveTextContent('background')
  })

  it('says so for an unknown exploration', () => {
    renderAt('/explorations/nope')

    expect(screen.getByText('exploration missing')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'board' })).toBeInTheDocument()
  })

  it('offers the theme to switch to, and toggles it', async () => {
    const { rerender } = renderAt('/')
    await userEvent.click(screen.getByRole('button', { name: 'switch to dark' }))
    expect(toggle).toHaveBeenCalledOnce()

    vi.mocked(useTheme).mockReturnValue({ theme: 'dark', toggle })
    rerender(<App />)
    expect(screen.getByRole('button', { name: 'switch to light' })).toBeInTheDocument()
  })
})
