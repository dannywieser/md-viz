import { stat } from 'node:fs/promises'
import path from 'node:path'

/** checks that `folder` is an absolute path to an existing directory and returns it. */
export async function assertDirectory(folder: unknown): Promise<string> {
  if (typeof folder !== 'string' || !path.isAbsolute(folder)) {
    throw new Error('expected an absolute folder path')
  }
  if (!(await stat(folder)).isDirectory()) {
    throw new Error('not a directory')
  }
  return folder
}
