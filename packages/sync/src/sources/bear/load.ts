import { listBearRows } from './bearcli'
import type { LoadedNotes } from '../types'

/**
 * bearcli lists every level of a nested tag (`daily`, `daily/10`, `daily/10/28`): only the deepest
 * is kept, since a tag that is the start of another tag of the same note is a part of it, not a
 * tag of its own.
 */
function deepestTags(tags: string[]): string[] {
  return tags.filter((tag) => !tags.some((other) => other.startsWith(`${tag}/`)))
}

/**
 * reads the notes of the Bear library, the archive included, as notes. trashed notes are not
 * listed and locked ones are skipped: their content cannot be read. Bear's note id is the id,
 * and its tags lose the leading `#` that bearcli prints and are the deepest ones (see above).
 */
export async function loadBearNotes(): Promise<LoadedNotes> {
  const rows = await listBearRows('all,content')
  const notes = rows
    .filter((row) => row.locked !== 'yes')
    .map((row) => ({
      id: row.id,
      source: 'bear' as const,
      title: row.title,
      body: row.content ?? '',
      tags: deepestTags(row.tags.map((tag) => tag.replace(/^#/, ''))),
      created: new Date(row.created).toISOString(),
      modified: new Date(row.modified).toISOString(),
    }))
  return { notes, failed: [] }
}
