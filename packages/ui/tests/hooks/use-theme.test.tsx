import { act, renderHook } from '@testing-library/react'
import { THEME_STORAGE_KEY, useTheme } from '../../src/hooks/use-theme'
import { themes } from '../../src/lib/themes'

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('data-theme')
  vi.restoreAllMocks()
})

describe('useTheme', () => {
  it('starts with solarized and applies it to the page', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme.id).toBe('solarized')
    expect(result.current.themes).toBe(themes)
    expect(document.documentElement.dataset.theme).toBe('solarized')
  })

  it('starts with the remembered theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dracula')

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme.id).toBe('dracula')
    expect(document.documentElement.dataset.theme).toBe('dracula')
  })

  it('ignores a remembered theme that does not exist', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'nope')

    expect(renderHook(() => useTheme()).result.current.theme.id).toBe('solarized')
  })

  it('applies and remembers the theme it is given', () => {
    const { result } = renderHook(() => useTheme())

    act(() => result.current.setTheme('gotham'))

    expect(result.current.theme.id).toBe('gotham')
    expect(document.documentElement.dataset.theme).toBe('gotham')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('gotham')
  })

  it('falls back to the default for an unknown id', () => {
    const { result } = renderHook(() => useTheme())

    act(() => result.current.setTheme('nope'))

    expect(result.current.theme.id).toBe('solarized')
  })

  it('works when local storage cannot be used', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const { result } = renderHook(() => useTheme())

    act(() => result.current.setTheme('nord-dark'))

    expect(result.current.theme.id).toBe('nord-dark')
  })
})
