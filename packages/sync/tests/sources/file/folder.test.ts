import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { assertDirectory } from '../../../src/sources/file/folder'

describe('assertDirectory', () => {
  let folder: string

  beforeEach(async () => {
    folder = await mkdtemp(path.join(tmpdir(), 'md-viz-folder-'))
  })

  afterEach(async () => {
    await rm(folder, { recursive: true, force: true })
  })

  it('returns an existing absolute directory', async () => {
    expect(await assertDirectory(folder)).toBe(folder)
  })

  it.each([
    ['not a string', 42],
    ['relative', 'notes'],
  ])('rejects a path that is %s', async (_, value) => {
    await expect(assertDirectory(value)).rejects.toThrow('expected an absolute folder path')
  })

  it('rejects a path that is a file', async () => {
    const file = path.join(folder, 'a.md')
    await writeFile(file, '')

    await expect(assertDirectory(file)).rejects.toThrow('not a directory')
  })
})
