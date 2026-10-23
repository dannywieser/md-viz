import { act, renderHook } from '@testing-library/react'
import { useTheme } from '../src/theme'

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches, media: query }))
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    mockMatchMedia(false)
  })

  it('starts light when nothing is stored and the system is light', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('follows a dark system color scheme when nothing is stored', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')
  })

  it('prefers the stored choice over the system', () => {
    localStorage.setItem('md-viz-design-theme', 'light')
    mockMatchMedia(true)
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')
  })

  it('ignores a stored value that is not a theme', () => {
    localStorage.setItem('md-viz-design-theme', 'purple')
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')
  })

  it('toggles the theme, the dark class and the stored choice', () => {
    const { result } = renderHook(() => useTheme())

    act(() => result.current.toggle())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('md-viz-design-theme')).toBe('dark')

    act(() => result.current.toggle())
    expect(result.current.theme).toBe('light')
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('md-viz-design-theme')).toBe('light')
  })
})
