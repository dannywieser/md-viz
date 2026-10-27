import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { assertDirectory, parseSource, parseTarget } from '../src/target'

describe('target', () => {
  let folder: string

  beforeEach(async () => {
    folder = await mkdtemp(path.join(tmpdir(), 'md-viz-target-'))
  })

  afterEach(async () => {
    await rm(folder, { recursive: true, force: true })
  })

  describe('assertDirectory', () => {
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

  describe('parseTarget', () => {
    it('accepts Bear without a folder', async () => {
      expect(await parseTarget({ source: 'bear', folder: '/ignored' })).toEqual({ source: 'bear' })
    })

    it('accepts a file source with an existing folder', async () => {
      expect(await parseTarget({ source: 'file', folder })).toEqual({ source: 'file', folder })
    })

    it.each([
      ['no target', undefined, 'expected a source'],
      ['an unknown source', { source: 'notion' }, 'expected a source'],
      ['a file source without a folder', { source: 'file' }, 'expected an absolute folder path'],
      [
        'a relative folder',
        { source: 'file', folder: 'notes' },
        'expected an absolute folder path',
      ],
    ])('rejects %s', async (_, target, message) => {
      await expect(parseTarget(target)).rejects.toThrow(message)
    })
  })

  describe('parseSource', () => {
    it.each(['file', 'bear'])('accepts %s', (source) => {
      expect(parseSource(source)).toBe(source)
    })

    it.each([undefined, 'notion', 1])('rejects %s', (source) => {
      expect(() => parseSource(source)).toThrow('expected a source')
    })
  })
})
