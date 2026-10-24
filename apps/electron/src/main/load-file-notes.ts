import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
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
  /** notes that exist in the source but could not be read; they are left out of `notes`. */
  failed: number
}

/**
 * reads the markdown files under `root` as notes. the file's modification time is the note's
 * `modified`; tags and the creation date are not read from files yet.
 */
export async function loadFileNotes(root: string): Promise<LoadedNotes> {
  const notes: Note[] = []
  let failed = 0
  for await (const file of walkMarkdown(root)) {
    try {
      const [{ mtimeMs }, body] = await Promise.all([
        stat(file.absolutePath),
        readFile(file.absolutePath, 'utf8'),
      ])
      notes.push({
        id: noteId(file.relativePath),
        source: 'file',
        title: noteTitle(file.relativePath),
        body,
        tags: [],
        created: '',
        modified: new Date(mtimeMs).toISOString(),
      })
    } catch {
      failed += 1
    }
  }
  return { notes, failed }
}
