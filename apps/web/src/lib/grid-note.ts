import type { Note } from '@md-viz/ui'

/** the tags of a cached note: its `tags` field is a JSON array of strings; anything else is no tags. */
export function parseTags(value: string | undefined): string[] {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((tag) => typeof tag === 'string') : []
  } catch {
    return []
  }
}

/**
 * a cached note as a grid note, listing its full tags and titled by its title, else its id. it has no
 * colours for now: they will come from the cache's sets (the `tags` grouping) in a later change.
 */
export function toGridNote(row: { id: string; fields: Record<string, string> }): Note {
  return {
    id: row.id,
    title: row.fields['title'] ?? row.id,
    colors: [],
    tags: parseTags(row.fields['tags']),
  }
}
