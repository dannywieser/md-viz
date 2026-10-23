// @vitest-environment node
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { readState, updateState } from '../../src/main/state'

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
    expect(await readState(file)).toEqual({ lastFolder: null, syncs: {} })
  })

  it('reads an empty state when the file is corrupt', async () => {
    await updateState(file, () => {})
    await writeFile(file, '{not json')
    expect(await readState(file)).toEqual({ lastFolder: null, syncs: {} })
  })

  it('round-trips changes, creating the directory', async () => {
    const lastSync = {
      syncedAt: '2026-10-20T09:30:00.000Z',
      notes: { updated: [{ id: 'a', title: 'a' }], deleted: [], unchanged: [] },
    }
    await updateState(file, (state) => {
      state.lastFolder = '/notes'
      state.syncs['/notes'] = lastSync
    })
    await updateState(file, (state) => {
      state.syncs['/other'] = lastSync
    })

    expect(await readState(file)).toEqual({
      lastFolder: '/notes',
      syncs: { '/notes': lastSync, '/other': lastSync },
    })
  })
})
