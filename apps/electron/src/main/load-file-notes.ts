import { createHash } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import type { Note } from './notes'
import { walkMarkdown } from './walk'

/** the cache id of a file note: a short, stable, slash-free hash of its path relative to the folder. */
export function noteId(relativePath: string): string {
  return createHash('sha256').update(relativePath).digest('hex').slice(0, 16)
}

/** the note title: the file name without its `.md` extension. */
export function noteTitle(relativePath: string): string {
  return path.posix.basename(relativePath).replace(/\.md$/i, '')
}

export interface LoadedNotes {
  notes: Note[]
  /** ids of notes that exist in the source but could not be read; they are left out of `notes`. */
  failed: string[]
}

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
