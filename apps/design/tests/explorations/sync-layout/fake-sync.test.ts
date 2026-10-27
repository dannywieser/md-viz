import {
  BATCH_SIZE,
  doneGroups,
  emptyGroups,
  makeNotes,
  scanProgress,
  syncProgress,
  titleAt,
  TO_PUSH,
} from '../../../src/explorations/sync-layout/fake-sync'

describe('fake sync data', () => {
  it('makes the same titles every time', () => {
    expect(titleAt(0)).toBe('garden plan 1')
    expect(makeNotes(2, 10).map((note) => note.id)).toEqual(['note-10', 'note-11'])
  })

  it('has three groups, filled or empty', () => {
    expect(doneGroups().updated).toHaveLength(TO_PUSH)
    expect(emptyGroups()).toEqual({ updated: [], deleted: [], unchanged: [] })
  })

  it('reports sync progress with the batch in progress', () => {
    expect(syncProgress(0)).toMatchObject({ done: 0, batch: [1, BATCH_SIZE] })
    expect(syncProgress(50)).toMatchObject({ done: TO_PUSH / 2, batch: [101, 150] })
  })

  it('ends the last batch at the total and keeps the title inside the sync', () => {
    const end = syncProgress(100)

    expect(end.done).toBe(TO_PUSH)
    expect(end.batch).toEqual([201, TO_PUSH])
    expect(end.title).toBe(titleAt(1000 + TO_PUSH - 1))
  })

  it('reports scan progress', () => {
    expect(scanProgress(0)).toEqual({ dirs: 0, mdFiles: 0 })
    expect(scanProgress(100)).toEqual({ dirs: 160, mdFiles: 410 })
  })
})
