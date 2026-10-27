import { listBearRows } from './bearcli'
import type { LoadedNotes } from '../types'

/**
 * reads the notes of the Bear library, the archive included, as notes. trashed notes are not
 * listed and locked ones are skipped: their content cannot be read. Bear's note id is the id,
 * and its tags lose the leading `#` that bearcli prints.
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
      tags: row.tags.map((tag) => tag.replace(/^#/, '')),
      created: new Date(row.created).toISOString(),
      modified: new Date(row.modified).toISOString(),
    }))
  return { notes, failed: [] }
}
