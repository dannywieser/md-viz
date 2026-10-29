import type { TagColors } from '../types'

/**
 * how many hue colours the note palette has (`HUE_COLORS` in `@md-viz/ui`); the grey after them is
 * for notes without tags and never goes to a tag. kept here because this package has no UI.
 */
export const TAG_COLOR_COUNT = 24

/** colours follow only the top level of a nested tag: `daily/10/28` is `daily`. a tag that starts with a slash is kept whole. */
export function topLevelTag(tag: string): string {
  const top = tag.split('/')[0] ?? tag
  return top === '' ? tag : top
}

/**
 * the colours for the tags that have none in `existing`: each takes the palette colour the fewest
 * tags use so far (the lowest on a tie), so colours are used evenly and wrap around once there are
 * more tags than colours. tags are handled in alphabetical order, so the same tags always get the
 * same colours. a tag in `existing` keeps its colour and is not in the result.
 */
export function assignTagColors(existing: TagColors, tags: string[]): TagColors {
  const used = new Array<number>(TAG_COLOR_COUNT).fill(0)
  for (const color of Object.values(existing)) used[color % TAG_COLOR_COUNT]++

  const added = new Map<string, number>()
  const fresh = [...new Set(tags)].filter((tag) => !Object.hasOwn(existing, tag)).sort()
  for (const tag of fresh) {
    const color = used.indexOf(Math.min(...used))
    used[color]++
    added.set(tag, color)
  }
  return Object.fromEntries(added)
}
