import { tagColorIndexes, type Note } from '@md-viz/ui'

/** the tags of a cached note: its `tags` field is a JSON array of strings; anything else is no tags. */
export function parseTags(value: string | undefined): string[] {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((tag) => typeof tag === 'string') : []
  } catch {
    return []
  }
}

/** a cached note as a grid note: coloured by the top level of its tags (the ones the cache has no colour for are left out), listing its full tags, and titled by its title, else its id. */
export function toGridNote(
  row: { id: string; fields: Record<string, string> },
  tagColors: ReadonlyMap<string, number>,
): Note {
  const tags = parseTags(row.fields['tags'])
  return {
    id: row.id,
    title: row.fields['title'] ?? row.id,
    colors: tagColorIndexes(tags, (tag) => tagColors.get(tag)),
    tags,
  }
}
