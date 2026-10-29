/** tag colours follow only the top level of a nested tag: `daily/10/28` is `daily`. a tag that starts with a slash is kept whole. */
export function topLevelTag(tag: string): string {
  const top = tag.split('/')[0] ?? tag
  return top === '' ? tag : top
}

/**
 * the palette colours of a note's tags, in order: one for each distinct top-level tag (the notes
 * `daily/10/28` and `daily/10/29` count as `daily` once), leaving out tags `colorOf` has no
 * colour for. `colorOf` is given a top-level tag.
 */
export function tagColorIndexes(
  tags: string[],
  colorOf: (topLevel: string) => number | undefined,
): number[] {
  const seen = new Set<string>()
  const colors: number[] = []
  for (const tag of tags) {
    const top = topLevelTag(tag)
    if (seen.has(top)) continue
    seen.add(top)
    const color = colorOf(top)
    if (color !== undefined) colors.push(color)
  }
  return colors
}
