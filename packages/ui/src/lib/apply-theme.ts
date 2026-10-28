import { noteColors } from './note-palette'
import type { Theme } from './themes'

/** the CSS variables a theme sets on the page, by name. */
export function themeVariables(theme: Theme): Record<string, string> {
  const { ui, hues } = theme
  const variables: Record<string, string> = {
    '--background': ui.background,
    '--foreground': ui.text,
    '--card': ui.card,
    '--card-foreground': ui.text,
    '--popover': ui.background,
    '--popover-foreground': ui.text,
    '--primary': ui.primary,
    '--primary-foreground': ui.onPrimary,
    '--secondary': ui.panel,
    '--secondary-foreground': ui.text,
    '--muted': ui.panel,
    '--muted-foreground': ui.muted,
    '--accent': ui.panel,
    '--accent-foreground': ui.text,
    '--destructive': `color-mix(in srgb, ${hues.red} 70%, black)`,
    '--border': ui.border,
    '--input': ui.border,
    '--ring': ui.focus,
    '--focus': ui.focus,
    '--shadow-color': ui.shadow,
    '--grid-dot': ui.border,
    '--note-stroke': `color-mix(in srgb, ${ui.muted} 45%, ${ui.card})`,
  }
  noteColors(theme).forEach((color, index) => {
    variables[`--note-${index}`] = color
  })
  return variables
}

/** shows a theme: sets its variables on the page (the root element by default). */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement) {
  for (const [name, value] of Object.entries(themeVariables(theme))) {
    root.style.setProperty(name, value)
  }
  root.dataset.theme = theme.id
}
