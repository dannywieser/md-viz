import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../src/app'
import { useTheme } from '../src/theme'

vi.mock('../src/theme', () => ({ useTheme: vi.fn() }))
vi.mock('../src/board', () => ({ Board: () => <div>board page</div> }))
vi.mock('../src/routes/background', () => ({ Background: () => <div>background page</div> }))

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

  it('shows the board at the root, with a link to the background exploration', () => {
    renderAt('/')

    expect(screen.getByText('board page')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toHaveTextContent('design')
    expect(screen.getByRole('link', { name: 'background' })).toHaveAttribute('href', '/background')
  })

  it('shows the background exploration, with a link back to the board', () => {
    renderAt('/background')

    expect(screen.getByText('background page')).toBeInTheDocument()
    expect(screen.queryByText('board page')).toBeNull()
    expect(screen.getByRole('link', { name: 'board' })).toHaveAttribute('href', '/')
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
