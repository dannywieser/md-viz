import {
  doneGroups,
  emptyGroups,
  makeNotes,
  scanProgress,
  syncProgress,
  titleAt,
  TO_DELETE,
  TO_PUSH,
} from '../../../src/explorations/sync-layout/fake-sync'

describe('fake sync data', () => {
  it('makes the same titles every time', () => {
    expect(titleAt(0)).toBe('garden plan 1')
    expect(makeNotes(2, 10).map((note) => note.id)).toEqual(['note-10', 'note-11'])
  })

  it('has three groups, filled or empty', () => {
    expect(doneGroups().updated).toHaveLength(TO_PUSH)
    expect(doneGroups().deleted).toHaveLength(TO_DELETE)
    expect(emptyGroups()).toEqual({ updated: [], deleted: [], unchanged: [] })
  })

  it('pushes first, then deletes', () => {
    const total = TO_PUSH + TO_DELETE

    expect(syncProgress(0)).toEqual({ synced: 0, deleted: 0, total })
    expect(syncProgress(50)).toEqual({ synced: 123, deleted: 0, total })
    expect(syncProgress(100)).toEqual({ synced: TO_PUSH, deleted: TO_DELETE, total })
  })

  it('reports scan progress', () => {
    expect(scanProgress(0)).toEqual({ dirs: 0, mdFiles: 0 })
    expect(scanProgress(100)).toEqual({ dirs: 160, mdFiles: 410 })
  })
})
