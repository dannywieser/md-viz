import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../src/App'

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    mockMatchMedia(false)
  })

  it('renders every section of the design board', () => {
    render(<App />)

    for (const name of [
      'guidelines',
      'logo',
      'color',
      'typography',
      'spacing',
      'grid',
      'components',
      'note grid',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument()
    }
  })

  it('links to the background exploration from the board', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: 'background' })).toHaveAttribute('href', '/background')
  })

  it('follows the lowercase text only guideline', () => {
    render(<App />)

    const text = document.body.textContent
    expect(text).toBe(text.toLowerCase())
  })

  it('toggles the dark class and remembers the choice', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'switch to dark' }))

    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('md-viz-design-theme')).toBe('dark')

    await userEvent.click(screen.getByRole('button', { name: 'switch to light' }))

    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('md-viz-design-theme')).toBe('light')
  })

  it('follows the system color scheme when nothing is stored', () => {
    mockMatchMedia(true)
    render(<App />)

    expect(document.documentElement).toHaveClass('dark')
  })
})
