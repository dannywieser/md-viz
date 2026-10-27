import { readFile, readdir, stat } from 'node:fs/promises'
import type { Note } from '../../pipeline/notes'
import type { LoadedNotes } from '../types'
import { noteId, noteTitle } from './note-id'
import { walkMarkdown } from './walk'

/**
 * reads the markdown files under `root` as notes. the file's modification time is the note's
 * `modified`; tags and the creation date are not read from files yet.
 */
export async function loadFileNotes(root: string): Promise<LoadedNotes> {
  // an unreadable folder would look empty and wipe its notes from the cache, so fail first.
  await readdir(root)
  const notes: Note[] = []
  const failed: string[] = []
  for await (const file of walkMarkdown(root)) {
    const id = noteId(file.relativePath)
    try {
      const [{ mtimeMs }, body] = await Promise.all([
        stat(file.absolutePath),
        readFile(file.absolutePath, 'utf8'),
      ])
      notes.push({
        id,
        source: 'file',
        title: noteTitle(file.relativePath),
        body,
        tags: [],
        created: '',
        modified: new Date(mtimeMs).toISOString(),
      })
    } catch {
      failed.push(id)
    }
  }
  return { notes, failed }
}
