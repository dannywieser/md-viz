import type { ThemeVariant } from './candidate-themes'

/** hue names in the order the exploration shows them. */
export const HUE_NAMES = [
  'red',
  'orange',
  'yellow',
  'green',
  'cyan',
  'blue',
  'violet',
  'magenta',
] as const
export type HueName = (typeof HUE_NAMES)[number]

/** the order the hues are handed out in: neighbours are far apart on the colour wheel. */
export const HUE_ORDER: HueName[] = [
  'red',
  'cyan',
  'yellow',
  'violet',
  'green',
  'magenta',
  'blue',
  'orange',
]

/** how many strengths each hue comes in: full, muted into the theme and dark. */
export const TIERS = 3

/** the colours with a hue; the neutral one comes after them. */
export const HUE_COLORS = HUE_ORDER.length * TIERS

/** the index of the neutral colour, the default for notes without tags. */
export const NEUTRAL_INDEX = HUE_COLORS

/** how far the hue order is turned for each tier, so the first colour of a tier is far from the last of the one before. */
const TIER_TURN = 3

function tierColor(hue: string, tier: number, muted: string): string {
  if (tier === 0) return hue
  if (tier === 1) return `color-mix(in srgb, ${hue} 55%, ${muted})`
  return `color-mix(in srgb, ${hue} 65%, black)`
}

/**
 * the note colours of a theme variant: 8 hues x 3 tiers (full, muted into the theme's muted text
 * colour, darkened), each tier turning the hue order, then the neutral grey as the last entry.
 */
export function noteColors(variant: ThemeVariant): string[] {
  const colors: string[] = []
  for (let tier = 0; tier < TIERS; tier++) {
    for (let i = 0; i < HUE_ORDER.length; i++) {
      const name = HUE_ORDER[(i + tier * TIER_TURN) % HUE_ORDER.length]
      colors.push(tierColor(variant.hues[name], tier, variant.ui.muted))
    }
  }
  colors.push(variant.ui.muted)
  return colors
}
