import type { FileTarget } from '../../types'
import type { SourceAdapter } from '../types'
import { loadFileNotes } from './load'
import { scanMarkdown } from './scan'

/** the file source: the `.md` files under a folder. */
export const fileSource: SourceAdapter<FileTarget> = {
  load: (target) => loadFileNotes(target.folder),
  scan: (target, onProgress) => scanMarkdown(target.folder, onProgress),
}
