import { readdir } from 'node:fs/promises'
import path from 'node:path'

const SKIPPED_DIRS = new Set(['node_modules'])

function isSkippedDir(name: string): boolean {
  return name.startsWith('.') || SKIPPED_DIRS.has(name)
}

export interface MarkdownFile {
  absolutePath: string
  /** path relative to the walked root, always with `/` separators. */
  relativePath: string
}

/**
 * yields the `.md` files under `root`, recursively. dot-directories and
 * `node_modules` are skipped; symlinks are not followed; unreadable
 * directories are ignored. `onDir` is called once per readable directory,
 * after its entries were yielded.
 */
export async function* walkMarkdown(
  root: string,
  onDir?: () => void,
): AsyncGenerator<MarkdownFile> {
  const walk = async function* (dir: string, relative: string): AsyncGenerator<MarkdownFile> {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const entryRelative = relative ? `${relative}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        if (!isSkippedDir(entry.name)) yield* walk(path.join(dir, entry.name), entryRelative)
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        yield { absolutePath: path.join(dir, entry.name), relativePath: entryRelative }
      }
    }
    onDir?.()
  }

  yield* walk(root, '')
}
