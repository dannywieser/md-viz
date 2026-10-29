import { DEFAULT_NOTE_COLOR, NOTE_COLORS } from './note-colors'

/** how many stripes a square can have: the colours of a note's first tags. */
export const MAX_STRIPES = 3

/** the palette colours a note is drawn with: its first MAX_STRIPES, wrapped onto the palette; the neutral grey when it has none. */
export function stripeColors(colors: number[]): number[] {
  if (colors.length === 0) return [DEFAULT_NOTE_COLOR]
  return colors
    .slice(0, MAX_STRIPES)
    .map((color) => ((color % NOTE_COLORS) + NOTE_COLORS) % NOTE_COLORS)
}

/** the heights (whole px) of `count` stripes that fill `size` px; the first stripes take the leftover px. */
export function stripeHeights(size: number, count: number): number[] {
  const base = Math.floor(size / count)
  const extra = size - base * count
  return Array.from({ length: count }, (_, i) => base + (i < extra ? 1 : 0))
}
