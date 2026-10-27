import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { parseSource, parseTarget } from '../src/target'

describe('target', () => {
  let folder: string

  beforeEach(async () => {
    folder = await mkdtemp(path.join(tmpdir(), 'md-viz-target-'))
  })

  afterEach(async () => {
    await rm(folder, { recursive: true, force: true })
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
