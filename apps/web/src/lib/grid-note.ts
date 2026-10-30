import type { GridNote } from '@md-viz/ui'

/** a cached note as a grid note, titled by its title, else its id. */
export function toGridNote(row: { id: string; fields: Record<string, string> }): GridNote {
  return { id: row.id, title: row.fields['title'] ?? row.id }
}
