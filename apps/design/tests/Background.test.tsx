import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../src/App'
import { variants } from '../src/routes/background-variants'

describe('background route', () => {
  beforeEach(() => {
    localStorage.clear()
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    window.history.pushState({}, '', '/background')
  })

  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('shows every variant in light and dark', () => {
    render(<App />)

    for (const variant of variants) {
      expect(screen.getByRole('heading', { level: 2, name: variant.name })).toBeInTheDocument()
      expect(screen.getByTestId(`swatch-${variant.id}-light`)).toBeInTheDocument()
      expect(screen.getByTestId(`swatch-${variant.id}-dark`)).toBeInTheDocument()
    }
  })

  it('links back to the board', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: 'board' })).toHaveAttribute('href', '/')
  })

  it('switches between one card and several cards', async () => {
    render(<App />)
    const swatch = () => screen.getByTestId('swatch-dots-16-light')
    const before = swatch().children.length

    await userEvent.click(screen.getByRole('button', { name: 'several cards' }))

    expect(swatch().children.length).toBeGreaterThan(before)
  })

  it('draws dots with the scaled spacing following the note cell', () => {
    const scaled = variants.find((variant) => variant.id === 'dots-scaled')!
    const style = scaled.style({ mode: 'light', cell: 6, strength: 1 })

    expect(style.backgroundSize).toBe('18px 18px')
  })

  it('follows the lowercase text only guideline', () => {
    render(<App />)

    const text = document.body.textContent
    expect(text).toBe(text.toLowerCase())
  })
})
