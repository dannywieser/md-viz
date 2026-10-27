import type { FileTarget } from '../../types'
import type { SourceAdapter } from '../types'
import { assertDirectory } from './folder'
import { loadFileNotes } from './load'
import { scanMarkdown } from './scan'

/** the file source: the `.md` files under a folder. */
export const fileSource: SourceAdapter<FileTarget> = {
  load: (target) => loadFileNotes(target.folder),
  scan: (target, onProgress) => scanMarkdown(target.folder, onProgress),
  parse: async (input) => ({ source: 'file', folder: await assertDirectory(input['folder']) }),
  // one sync per folder.
  key: (target) => `file:${target.folder}`,
  remember: (state, target) => void (state.lastFolder = target.folder),
  // the last folder, unless it is gone.
  restore: async (state) => {
    if (!state.lastFolder) return null
    try {
      return { source: 'file', folder: await assertDirectory(state.lastFolder) }
    } catch {
      return null
    }
  },
}
