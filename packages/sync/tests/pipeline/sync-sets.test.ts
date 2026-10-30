import { buildSyncSets, type TimedNote } from '../../src/pipeline/sync-sets'

const now = new Date(2026, 9, 27, 12, 0, 0)
const at = (month: number, day: number, hour = 8) => new Date(2026, month, day, hour).toISOString()
const TODAY = at(9, 27)
const LAST_WEEK = at(9, 20)
const LONG_AGO = at(7, 1)

const byName = (sets: { id: string; noteIds: string[] }[]) =>
  Object.fromEntries(sets.map((set) => [set.id, set.noteIds]))

describe('buildSyncSets', () => {
  it('returns the seven sets of a bear sync, ranked in the order a note is placed in them', () => {
    const sets = buildSyncSets('bear', [], now)

    expect(sets.map((set) => [set.id, set.rank])).toEqual([
      ['created-today', 0],
      ['updated-today', 1],
      ['created-last-30-days', 2],
      ['updated-last-30-days', 3],
      ['deleted-today', 4],
      ['deleted-last-30-days', 5],
      ['unchanged', 6],
    ])
    expect(sets.every((set) => set.noteIds.length === 0)).toBe(true)
  })

  it('has no created sets for the file source and keeps the ranks of the others', () => {
    const sets = buildSyncSets('file', [], now)

    expect(sets.map((set) => [set.id, set.rank])).toEqual([
      ['updated-today', 1],
      ['updated-last-30-days', 3],
      ['deleted-today', 4],
      ['deleted-last-30-days', 5],
      ['unchanged', 6],
    ])
  })

  it('puts a note updated today only in updated-today and a note from last week only in the second', () => {
    const notes: TimedNote[] = [
      { id: 'today', synced: TODAY },
      { id: 'week', synced: LAST_WEEK },
    ]

    const sets = byName(buildSyncSets('file', notes, now))

    expect(sets['updated-today']).toEqual(['today'])
    expect(sets['updated-last-30-days']).toEqual(['week'])
    expect(sets['unchanged']).toEqual([])
  })

  it('treats today as the local calendar day, from midnight to midnight', () => {
    const notes: TimedNote[] = [
      { id: 'start', synced: new Date(2026, 9, 27, 0, 0, 0).toISOString() },
      { id: 'before', synced: new Date(2026, 9, 26, 23, 59, 59).toISOString() },
      { id: 'after', synced: new Date(2026, 9, 28, 0, 0, 0).toISOString() },
    ]

    expect(byName(buildSyncSets('file', notes, now))['updated-today']).toEqual(['start'])
  })

  it('treats the last 30 days as a rolling window from now', () => {
    const edge = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const notes: TimedNote[] = [
      { id: 'edge', synced: edge.toISOString() },
      { id: 'out', synced: new Date(edge.getTime() - 1).toISOString() },
    ]

    const sets = byName(buildSyncSets('file', notes, now))

    expect(sets['updated-last-30-days']).toEqual(['edge'])
    expect(sets['unchanged']).toEqual(['out'])
  })

  it('puts a note not updated in 30 days, or never stamped, in unchanged', () => {
    const notes: TimedNote[] = [
      { id: 'old', synced: LONG_AGO },
      { id: 'blank', synced: '' },
      { id: 'none' },
    ]

    expect(byName(buildSyncSets('file', notes, now))['unchanged']).toEqual(['old', 'blank', 'none'])
  })

  it('builds the created sets from the created time of a bear note', () => {
    const notes: TimedNote[] = [
      { id: 'new', created: TODAY, synced: TODAY },
      { id: 'week', created: LAST_WEEK, synced: LAST_WEEK },
      { id: 'none', created: '', synced: TODAY },
    ]

    const sets = byName(buildSyncSets('bear', notes, now))

    expect(sets['created-today']).toEqual(['new'])
    expect(sets['created-last-30-days']).toEqual(['week'])
    expect(sets['updated-today']).toEqual(['none'])
  })

  it('puts a note in the first set it fits: created today, updated today, created, updated, unchanged', () => {
    const notes: TimedNote[] = [
      { id: 'created-and-updated-today', created: TODAY, synced: TODAY },
      { id: 'old-updated-today', created: LONG_AGO, synced: TODAY },
      { id: 'recent-updated-today', created: LAST_WEEK, synced: TODAY },
      { id: 'created-last-week', created: LAST_WEEK, synced: LAST_WEEK },
      { id: 'old-updated-last-week', created: LONG_AGO, synced: LAST_WEEK },
      { id: 'untouched', created: LONG_AGO, synced: LONG_AGO },
    ]

    expect(byName(buildSyncSets('bear', notes, now))).toEqual({
      'created-today': ['created-and-updated-today'],
      'updated-today': ['old-updated-today', 'recent-updated-today'],
      'created-last-30-days': ['created-last-week'],
      'updated-last-30-days': ['old-updated-last-week'],
      'deleted-today': [],
      'deleted-last-30-days': [],
      unchanged: ['untouched'],
    })
  })

  it('puts every note in at most one set', () => {
    const notes: TimedNote[] = [
      { id: 'a', created: TODAY, synced: TODAY },
      { id: 'b', created: LAST_WEEK, synced: TODAY },
      { id: 'c', created: LONG_AGO, synced: LONG_AGO },
      { id: 'd', created: TODAY, synced: TODAY, deleted: TODAY },
      { id: 'e', synced: LAST_WEEK, deleted: LAST_WEEK },
      { id: 'f', synced: LONG_AGO, deleted: LONG_AGO },
    ]

    const ids = buildSyncSets('bear', notes, now).flatMap((set) => set.noteIds)

    expect(ids.sort()).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('puts a deleted note only in the deleted set of its period', () => {
    const notes: TimedNote[] = [
      { id: 'gone-today', created: TODAY, synced: TODAY, deleted: TODAY },
      { id: 'gone-week', synced: LONG_AGO, deleted: LAST_WEEK },
      { id: 'gone-long-ago', synced: LONG_AGO, deleted: LONG_AGO },
    ]

    const sets = byName(buildSyncSets('bear', notes, now))

    expect(sets['deleted-today']).toEqual(['gone-today'])
    expect(sets['deleted-last-30-days']).toEqual(['gone-week'])
    for (const name of ['created-today', 'updated-today', 'updated-last-30-days', 'unchanged']) {
      expect(sets[name]).toEqual([])
    }
  })

  it('leaves out a note whose time cannot be read', () => {
    const notes: TimedNote[] = [{ id: 'bad', synced: 'yesterday', deleted: 'later' }]

    const sets = byName(buildSyncSets('file', notes, now))

    expect(sets['updated-last-30-days']).toEqual([])
    expect(sets['deleted-last-30-days']).toEqual([])
  })
})
