import type { HueName } from './derive-note-colors'

/** the UI roles of a theme, as the app tokens they set. */
export interface UiRoles {
  background: string
  text: string
  card: string
  /** secondary, muted and accent backgrounds. */
  panel: string
  /** muted text. */
  muted: string
  /** the primary colour: buttons and highlights. */
  primary: string
  /** text on the primary colour. */
  onPrimary: string
  border: string
}

/** a theme is one fixed look; there is no light or dark mode. */
export interface CandidateTheme {
  id: string
  name: string
  /** where the colours come from. */
  source: string
  ui: UiRoles
  /** the eight accent hues the note colours are derived from. */
  hues: Record<HueName, string>
}

const SOLARIZED_HUES: CandidateTheme['hues'] = {
  red: '#dc322f',
  orange: '#cb4b16',
  yellow: '#b58900',
  green: '#859900',
  cyan: '#2aa198',
  blue: '#268bd2',
  violet: '#6c71c4',
  magenta: '#d33682',
}

const NORD_HUES: CandidateTheme['hues'] = {
  red: '#bf616a',
  orange: '#d08770',
  yellow: '#ebcb8b',
  green: '#a3be8c',
  cyan: '#8fbcbb',
  blue: '#5e81ac',
  violet: '#b48ead',
  magenta: '#81a1c1',
}

export const candidateThemes: CandidateTheme[] = [
  {
    id: 'solarized',
    name: 'solarized',
    source: "the app's solarized light today: orange buttons, white cards, base2 panels",
    ui: {
      background: '#fdf6e3',
      text: '#586e75',
      card: '#ffffff',
      panel: '#eee8d5',
      muted: '#657b83',
      primary: '#cb4b16',
      onPrimary: '#fdf6e3',
      border: 'color-mix(in srgb, #93a1a1 40%, transparent)',
    },
    hues: SOLARIZED_HUES,
  },
  {
    id: 'gruvbox-dark',
    name: 'gruvbox dark',
    source: 'the gruvbox bright colours',
    ui: {
      background: '#282828',
      text: '#ebdbb2',
      card: '#3c3836',
      panel: '#3c3836',
      muted: '#b5a292',
      primary: '#d79921',
      onPrimary: '#282828',
      border: '#504945',
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
  {
    id: 'nord-dark',
    name: 'nord dark',
    source: 'nord aurora and frost (only seven hues: magenta is a light steel blue)',
    ui: {
      background: '#2e3440',
      text: '#eceff4',
      card: '#3b4252',
      panel: '#3b4252',
      muted: '#a3b1c6',
      primary: '#88c0d0',
      onPrimary: '#2e3440',
      border: '#4c566a',
    },
    hues: NORD_HUES,
  },
  {
    id: 'nord-light',
    name: 'nord light',
    source: 'nord aurora and frost (only seven hues: magenta is a light steel blue)',
    ui: {
      background: '#eceff4',
      text: '#2e3440',
      card: '#e5e9f0',
      panel: '#e5e9f0',
      muted: '#4c566a',
      primary: '#5e81ac',
      onPrimary: '#eceff4',
      border: '#d8dee9',
    },
    hues: NORD_HUES,
  },
  {
    id: 'catppuccin-mocha',
    name: 'catppuccin mocha',
    source: 'catppuccin mocha',
    ui: {
      background: '#1e1e2e',
      text: '#cdd6f4',
      card: '#313244',
      panel: '#313244',
      muted: '#a6adc8',
      primary: '#cba6f7',
      onPrimary: '#1e1e2e',
      border: '#585b70',
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
  {
    id: 'catppuccin-latte',
    name: 'catppuccin latte',
    source: 'catppuccin latte',
    ui: {
      background: '#eff1f5',
      text: '#4c4f69',
      card: '#e6e9ef',
      panel: '#e6e9ef',
      muted: '#626578',
      primary: '#8839ef',
      onPrimary: '#eff1f5',
      border: '#ccd0da',
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
  {
    id: 'dracula',
    name: 'dracula',
    source: 'dracula (blue is its comment colour)',
    ui: {
      background: '#282a36',
      text: '#f8f8f2',
      card: '#303445',
      panel: '#303445',
      muted: '#bcc4e0',
      primary: '#bd93f9',
      onPrimary: '#282a36',
      border: '#44475a',
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
  },
  {
    id: 'gotham',
    name: 'gotham',
    source: 'gotham (its blue, violet and magenta are very dim)',
    ui: {
      background: '#0c1014',
      text: '#c5d8de',
      card: '#10151c',
      panel: '#10151c',
      muted: '#7a94a5',
      primary: '#7ecbd4',
      onPrimary: '#0c1014',
      border: '#1f2b38',
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
  },
  {
    id: 'ocean',
    name: 'ocean',
    source:
      'the iTerm2 ocean terminal scheme (bright blue background); panel and muted are derived, orange and violet are mixes of its colours',
    ui: {
      background: '#224fbc',
      text: '#ffffff',
      card: '#1d43a0',
      panel: '#1d43a0',
      muted: '#c8d3ee',
      primary: '#00e5e5',
      onPrimary: '#224fbc',
      border: '#216dff',
    },
    hues: {
      red: '#e64c4c',
      orange: '#c07226',
      yellow: '#e5e500',
      green: '#00d900',
      cyan: '#00e5e5',
      blue: '#7373ff',
      violet: '#ac39f2',
      magenta: '#d826d8',
    },
  },
  {
    id: 'high-contrast',
    name: 'high contrast',
    source: 'a high contrast light set',
    ui: {
      background: '#ffffff',
      text: '#0e1116',
      card: '#f0f3f6',
      panel: '#f0f3f6',
      muted: '#424a53',
      primary: '#0349b4',
      onPrimary: '#ffffff',
      border: '#818b98',
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
  },
]
