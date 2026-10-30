/** the hues of a note palette in the order they are handed out: neighbours are far apart on the colour wheel. */
export const HUE_ORDER = [
  'red',
  'cyan',
  'yellow',
  'violet',
  'green',
  'magenta',
  'blue',
  'orange',
] as const

export type HueName = (typeof HUE_ORDER)[number]

/** how many strengths each hue comes in: full, muted into the theme and dark. */
export const TIERS = 3

/** the full-strength hues, the first tier; loaders and icons cycle through these. */
export const ACCENT_COLORS = HUE_ORDER.length

/** the colours with a hue; the neutral one comes after them. */
export const HUE_COLORS = ACCENT_COLORS * TIERS

/** how many colours the note palette has; note colours index into it and wrap around. */
export const NOTE_COLORS = HUE_COLORS + 1

/** the neutral grey: the colour of a note without tags. */
export const DEFAULT_NOTE_COLOR = HUE_COLORS

/** a palette colour as css; the theme sets `--note-0..24`, so a grid follows the theme switcher. */
export const colorVar = (index: number) => `var(--note-${index})`
