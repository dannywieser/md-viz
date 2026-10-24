import { listBearRows } from './bearcli'
import type { LoadedNotes } from './load-file-notes'

/**
 * reads the notes of the Bear library, the archive included, as notes. trashed notes are not
 * listed and locked ones are skipped: their content cannot be read. Bear's note id is the id.
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
      tags: row.tags,
      created: new Date(row.created).toISOString(),
      modified: new Date(row.modified).toISOString(),
    }))
  return { notes, failed: 0 }
}
