import { useCallback, useLayoutEffect, useState } from 'react'
import { applyTheme } from '../lib/apply-theme'
import { findTheme, themes, type Theme } from '../lib/themes'

/** where the chosen theme is remembered, in the app's own local storage. */
export const THEME_STORAGE_KEY = 'md-viz-theme'

function readStoredId(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

/** the chosen theme, applied to the page before it is painted and remembered between launches. */
export function useTheme(): { theme: Theme; themes: Theme[]; setTheme: (id: string) => void } {
  const [id, setId] = useState(() => findTheme(readStoredId()).id)

  useLayoutEffect(() => {
    applyTheme(findTheme(id))
  }, [id])

  const setTheme = useCallback((next: string) => {
    const theme = findTheme(next)
    setId(theme.id)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme.id)
    } catch {
      // the choice just is not remembered
    }
  }, [])

  return { theme: findTheme(id), themes, setTheme }
}
