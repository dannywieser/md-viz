import { createHash } from 'node:crypto'
import path from 'node:path'

/** the cache id of a file note: a short, stable, slash-free hash of its path relative to the folder. */
export function noteId(relativePath: string): string {
  return createHash('sha256').update(relativePath).digest('hex').slice(0, 16)
}

/** the note title: the file name without its `.md` extension. */
export function noteTitle(relativePath: string): string {
  return path.posix.basename(relativePath).replace(/\.md$/i, '')
}
