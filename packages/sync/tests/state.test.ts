// @vitest-environment node
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { readState, updateState } from '../src/state'

describe('state file', () => {
  let dir: string
  let file: string

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'md-viz-state-'))
    file = path.join(dir, 'nested', 'state.json')
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('reads an empty state when the file is missing', async () => {
    expect(await readState(file)).toEqual({ lastSource: 'file', lastFolder: null, syncs: {} })
  })

  it('reads an empty state when the file is corrupt', async () => {
    await updateState(file, () => {})
    await writeFile(file, '{not json')
    expect(await readState(file)).toEqual({ lastSource: 'file', lastFolder: null, syncs: {} })
  })

  it.each([
    ['null', 'null'],
    ['an unexpected shape', '{"lastFolder":5,"syncs":"nope"}'],
  ])('reads an empty state when the file holds %s', async (_, content) => {
    await updateState(file, () => {})
    await writeFile(file, content)

    expect(await readState(file)).toEqual({ lastSource: 'file', lastFolder: null, syncs: {} })
  })

  it('round-trips changes, creating the directory', async () => {
    const lastSync = {
      syncedAt: '2026-10-20T09:30:00.000Z',
      notes: { updated: [{ id: 'a', title: 'a', tags: ['x'] }], deleted: [], unchanged: [] },
      tagColors: { x: 3 },
    }
    await updateState(file, (state) => {
      state.lastFolder = '/notes'
      state.syncs['/notes'] = lastSync
    })
    await updateState(file, (state) => {
      state.syncs['/other'] = lastSync
    })

    expect(await readState(file)).toEqual({
      lastSource: 'file',
      lastFolder: '/notes',
      syncs: { '/notes': lastSync, '/other': lastSync },
    })
  })

  it('remembers Bear as the last source and falls back to files for anything else', async () => {
    await updateState(file, (state) => void (state.lastSource = 'bear'))
    expect((await readState(file)).lastSource).toBe('bear')

    await writeFile(file, '{"lastSource":"notion","lastFolder":null,"syncs":{}}')
    expect((await readState(file)).lastSource).toBe('file')
  })

  describe('syncs saved by older versions', () => {
    const save = async (syncs: unknown) => {
      await mkdir(path.dirname(file), { recursive: true })
      await writeFile(file, JSON.stringify({ lastSource: 'file', lastFolder: null, syncs }))
    }

    it('reads notes without tags and a sync without tag colours', async () => {
      await save({
        '/notes': {
          syncedAt: '2026-10-20T09:30:00.000Z',
          notes: { updated: [{ id: 'a', title: 'a' }], deleted: [], unchanged: [] },
        },
      })

      expect((await readState(file)).syncs['/notes']).toEqual({
        syncedAt: '2026-10-20T09:30:00.000Z',
        notes: { updated: [{ id: 'a', title: 'a', tags: [] }], deleted: [], unchanged: [] },
        tagColors: {},
      })
    })

    it('keeps the tags and colours that are valid and drops the rest', async () => {
      await save({
        '/notes': {
          syncedAt: '2026-10-20T09:30:00.000Z',
          notes: {
            updated: [{ id: 'a', title: 'a', tags: ['x', 5, 'y'] }, { id: 'b' }, 'nope'],
            deleted: 'nope',
          },
          tagColors: { x: 1, y: 'red' },
        },
      })

      expect((await readState(file)).syncs['/notes']).toEqual({
        syncedAt: '2026-10-20T09:30:00.000Z',
        notes: { updated: [{ id: 'a', title: 'a', tags: ['x', 'y'] }], deleted: [], unchanged: [] },
        tagColors: { x: 1 },
      })
    })

    it('treats tag colours that are not an object as none', async () => {
      await save({
        '/notes': {
          syncedAt: '2026-10-20T09:30:00.000Z',
          notes: { updated: [], deleted: [], unchanged: [] },
          tagColors: [1, 2],
        },
      })

      expect((await readState(file)).syncs['/notes']?.tagColors).toEqual({})
    })

    it('drops syncs that are not readable', async () => {
      await save({
        '/a': null,
        '/b': { syncedAt: 5, notes: {} },
        '/c': { syncedAt: 'now', notes: 'nope' },
        '/d': { syncedAt: 'now', notes: { updated: [], deleted: [], unchanged: [] } },
      })

      expect(Object.keys((await readState(file)).syncs)).toEqual(['/d'])
    })
  })
})
