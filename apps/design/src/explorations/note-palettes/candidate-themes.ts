import type { HueName } from './derive-note-colors'

export type Mode = 'light' | 'dark'

/** the UI roles of a theme, ported from the mdm palettes. */
export interface UiRoles {
  background: string
  panel: string
  text: string
  muted: string
  accent: string
  border: string
  success: string
  successText: string
}

export interface ThemeVariant {
  ui: UiRoles
  /** the eight accent hues the note colours are derived from. */
  hues: Record<HueName, string>
}

export interface CandidateTheme {
  id: string
  name: string
  /** where the hues come from. */
  source: string
  /** a theme with one mode shows that variant in both. */
  light?: ThemeVariant
  dark?: ThemeVariant
}

const SOLARIZED_HUES: ThemeVariant['hues'] = {
  red: '#dc322f',
  orange: '#cb4b16',
  yellow: '#b58900',
  green: '#859900',
  cyan: '#2aa198',
  blue: '#268bd2',
  violet: '#6c71c4',
  magenta: '#d33682',
}

const NORD_HUES: ThemeVariant['hues'] = {
  red: '#bf616a',
  orange: '#d08770',
  yellow: '#ebcb8b',
  green: '#a3be8c',
  cyan: '#8fbcbb',
  blue: '#5e81ac',
  violet: '#b48ead',
  magenta: '#81a1c1',
}

const DRACULA: ThemeVariant = {
  ui: {
    background: '#282a36',
    panel: '#303445',
    text: '#f8f8f2',
    muted: '#bcc4e0',
    accent: '#bd93f9',
    border: '#44475a',
    success: '#50fa7b',
    successText: '#1f232d',
  },
  hues: {
    red: '#ff5555',
    orange: '#ffb86c',
    yellow: '#f1fa8c',
    green: '#50fa7b',
    cyan: '#8be9fd',
    blue: '#6272a4',
    violet: '#bd93f9',
    magenta: '#ff79c6',
  },
}

const GOTHAM: ThemeVariant = {
  ui: {
    background: '#0c1014',
    panel: '#10151c',
    text: '#c5d8de',
    muted: '#7a94a5',
    accent: '#7ecbd4',
    border: '#1f2b38',
    success: '#2aa198',
    successText: '#0c1014',
  },
  hues: {
    red: '#c33027',
    orange: '#d26937',
    yellow: '#edb54b',
    green: '#26a98b',
    cyan: '#33859d',
    blue: '#195466',
    violet: '#4e5165',
    magenta: '#888ba5',
  },
}

const OCEAN: ThemeVariant = {
  ui: {
    background: '#0d1b2e',
    panel: '#112340',
    text: '#e2f0fb',
    muted: '#7bafd4',
    accent: '#38c4e8',
    border: '#1c3354',
    success: '#22d07a',
    successText: '#071018',
  },
  // the mdm theme has no accents of its own: these are made up around its blues.
  hues: {
    red: '#ff6b81',
    orange: '#ff9f43',
    yellow: '#feca57',
    green: '#22d07a',
    cyan: '#38c4e8',
    blue: '#4a90e2',
    violet: '#8e7cf0',
    magenta: '#e06bc4',
  },
}

const HIGH_CONTRAST: ThemeVariant = {
  ui: {
    background: '#ffffff',
    panel: '#f0f3f6',
    text: '#0e1116',
    muted: '#424a53',
    accent: '#0349b4',
    border: '#818b98',
    success: '#055d20',
    successText: '#ffffff',
  },
  hues: {
    red: '#a0111f',
    orange: '#a04100',
    yellow: '#744500',
    green: '#055d20',
    cyan: '#0a6b7a',
    blue: '#0349b4',
    violet: '#622cbc',
    magenta: '#971368',
  },
}

export const candidateThemes: CandidateTheme[] = [
  {
    id: 'solarized',
    name: 'solarized',
    source: 'the solarized accents (the current app theme)',
    dark: {
      ui: {
        background: '#002b36',
        panel: '#073642',
        text: '#eee8d5',
        muted: '#93a1a1',
        accent: '#b58900',
        border: '#586e75',
        success: '#859900',
        successText: '#002b36',
      },
      hues: SOLARIZED_HUES,
    },
    light: {
      ui: {
        background: '#fdf6e3',
        panel: '#eee8d5',
        text: '#073642',
        muted: '#506870',
        accent: '#268bd2',
        border: '#d3cbb8',
        success: '#859900',
        successText: '#fdf6e3',
      },
      hues: SOLARIZED_HUES,
    },
  },
  {
    id: 'gruvbox',
    name: 'gruvbox',
    source: 'the gruvbox bright (dark) and faded (light) colours',
    dark: {
      ui: {
        background: '#282828',
        panel: '#3c3836',
        text: '#ebdbb2',
        muted: '#b5a292',
        accent: '#d79921',
        border: '#504945',
        success: '#98971a',
        successText: '#1d2021',
      },
      hues: {
        red: '#fb4934',
        orange: '#fe8019',
        yellow: '#fabd2f',
        green: '#b8bb26',
        cyan: '#8ec07c',
        blue: '#83a598',
        violet: '#b16286',
        magenta: '#d3869b',
      },
    },
    light: {
      ui: {
        background: '#fbf1c7',
        panel: '#e8d5a3',
        text: '#3c3836',
        muted: '#5c5248',
        accent: '#076678',
        border: '#d5c4a1',
        success: '#79740e',
        successText: '#fbf1c7',
      },
      hues: {
        red: '#9d0006',
        orange: '#af3a03',
        yellow: '#b57614',
        green: '#79740e',
        cyan: '#427b58',
        blue: '#076678',
        violet: '#8f3f71',
        magenta: '#b16286',
      },
    },
  },
  {
    id: 'nord',
    name: 'nord',
    source: 'nord aurora and frost (only seven hues: magenta is a light steel blue)',
    dark: {
      ui: {
        background: '#2e3440',
        panel: '#3b4252',
        text: '#eceff4',
        muted: '#a3b1c6',
        accent: '#88c0d0',
        border: '#4c566a',
        success: '#a3be8c',
        successText: '#2e3440',
      },
      hues: NORD_HUES,
    },
    light: {
      ui: {
        background: '#eceff4',
        panel: '#e5e9f0',
        text: '#2e3440',
        muted: '#4c566a',
        accent: '#5e81ac',
        border: '#d8dee9',
        success: '#4c7a34',
        successText: '#eceff4',
      },
      hues: NORD_HUES,
    },
  },
  {
    id: 'catppuccin',
    name: 'catppuccin',
    source: 'catppuccin mocha (dark) and latte (light)',
    dark: {
      ui: {
        background: '#1e1e2e',
        panel: '#313244',
        text: '#cdd6f4',
        muted: '#a6adc8',
        accent: '#cba6f7',
        border: '#585b70',
        success: '#a6e3a1',
        successText: '#1e1e2e',
      },
      hues: {
        red: '#f38ba8',
        orange: '#fab387',
        yellow: '#f9e2af',
        green: '#a6e3a1',
        cyan: '#94e2d5',
        blue: '#89b4fa',
        violet: '#cba6f7',
        magenta: '#f5c2e7',
      },
    },
    light: {
      ui: {
        background: '#eff1f5',
        panel: '#e6e9ef',
        text: '#4c4f69',
        muted: '#626578',
        accent: '#8839ef',
        border: '#ccd0da',
        success: '#40a02b',
        successText: '#eff1f5',
      },
      hues: {
        red: '#d20f39',
        orange: '#fe640b',
        yellow: '#df8e1d',
        green: '#40a02b',
        cyan: '#179299',
        blue: '#1e66f5',
        violet: '#8839ef',
        magenta: '#ea76cb',
      },
    },
  },
  {
    id: 'dracula',
    name: 'dracula',
    source: 'dracula (dark only; blue is its comment colour)',
    dark: DRACULA,
  },
  {
    id: 'gotham',
    name: 'gotham',
    source: 'gotham (dark only; its blue, violet and magenta are very dim)',
    dark: GOTHAM,
  },
  {
    id: 'ocean',
    name: 'ocean',
    source: 'ocean (dark only; accents made up, the mdm theme has none)',
    dark: OCEAN,
  },
  {
    id: 'high-contrast',
    name: 'high contrast',
    source: 'a high contrast light set (light only)',
    light: HIGH_CONTRAST,
  },
]

/** the variant a theme shows in `mode`: its other variant when it has only one. */
export function variantFor(theme: CandidateTheme, mode: Mode): ThemeVariant {
  const variant = theme[mode] ?? theme.light ?? theme.dark
  if (!variant) throw new Error(`theme ${theme.id} has no variant`)
  return variant
}
