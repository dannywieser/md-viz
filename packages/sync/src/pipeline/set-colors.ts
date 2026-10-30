/** the colour index of each set id within one grouping, into the note palette. */
export type SetColors = Record<string, number>

/**
 * how many hue colours the note palette has (`HUE_COLORS` in `@md-viz/ui`); the grey after them is
 * for notes without tags and never goes to a set. kept here because this package has no UI.
 */
export const SET_COLOR_COUNT = 24

/** colours follow only the top level of a nested tag: `daily/10/28` is `daily`. a tag that starts with a slash is kept whole. */
export function topLevelTag(tag: string): string {
  const top = tag.split('/')[0] ?? tag
  return top === '' ? tag : top
}

/**
 * the colours for the set ids that have none in `existing` (the sets of one source and grouping,
 * each grouping uses the whole palette on its own): each takes the palette colour the fewest sets
 * use so far (the lowest on a tie), so colours are used evenly and wrap around once there are
 * more sets than colours. ids are handled in alphabetical order, so the same ids always get the
 * same colours. an id in `existing` keeps its colour and is not in the result.
 */
export function assignColors(existing: SetColors, ids: string[]): SetColors {
  const used = new Array<number>(SET_COLOR_COUNT).fill(0)
  for (const color of Object.values(existing)) used[color % SET_COLOR_COUNT]++

  const added = new Map<string, number>()
  const fresh = [...new Set(ids)].filter((id) => !Object.hasOwn(existing, id)).sort()
  for (const id of fresh) {
    const color = used.indexOf(Math.min(...used))
    used[color]++
    added.set(id, color)
  }
  return Object.fromEntries(added)
}
