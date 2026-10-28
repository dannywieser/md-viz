import { ACCENT_COLORS, HUE_ORDER, TIERS } from './note-colors'
import type { Theme } from './themes'

/** how far the hue order is turned for each tier, so the first colour of a tier is far from the last of the one before. */
const TIER_TURN = 3

function tierColor(hue: string, tier: number, muted: string): string {
  if (tier === 0) return hue
  if (tier === 1) return `color-mix(in srgb, ${hue} 55%, ${muted})`
  return `color-mix(in srgb, ${hue} 65%, black)`
}

/**
 * the note colours of a theme: the hues in three tiers (full, muted into the theme's muted text
 * colour, darkened), each tier turning the hue order, then the neutral grey as the last entry.
 */
export function noteColors(theme: Theme): string[] {
  const colors: string[] = []
  for (let tier = 0; tier < TIERS; tier++) {
    for (let i = 0; i < ACCENT_COLORS; i++) {
      const name = HUE_ORDER[(i + tier * TIER_TURN) % ACCENT_COLORS]
      colors.push(tierColor(theme.hues[name], tier, theme.ui.muted))
    }
  }
  colors.push(theme.ui.muted)
  return colors
}
