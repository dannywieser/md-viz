import { GROUPINGS } from '../../src/pipeline/groupings'

const now = new Date(2026, 9, 27, 12, 0, 0)
const today = new Date(2026, 9, 27, 8, 0, 0).toISOString()

function grouping(name: string) {
  const found = GROUPINGS.find((candidate) => candidate.name === name)
  if (!found) throw new Error(`no grouping ${name}`)
  return found
}

describe('GROUPINGS', () => {
  it('lists the groupings the sync fills, each once', () => {
    expect(GROUPINGS.map((g) => g.name)).toEqual(['tags', 'sync'])
  })

  it('builds the tag sets from the notes that exist, keeping known tags', () => {
    const sets = grouping('tags').build({
      source: 'bear',
      notes: [
        { id: 'a', tags: ['work'], synced: today },
        { id: 'b', tags: ['work', 'gone'], synced: today, deleted: today },
      ],
      known: ['old'],
      now,
    })

    expect(sets).toEqual([
      { id: 'old', rank: 0, noteIds: [] },
      { id: 'work', rank: 0, noteIds: ['a'] },
    ])
  })

  it('builds the sync sets from all the notes, deleted ones included', () => {
    const sets = grouping('sync').build({
      source: 'file',
      notes: [
        { id: 'a', tags: [], synced: today },
        { id: 'b', tags: [], synced: today, deleted: today },
      ],
      known: [],
      now,
    })

    const members = Object.fromEntries(sets.map((set) => [set.id, set.noteIds]))
    expect(members['updated-today']).toEqual(['a'])
    expect(members['deleted-today']).toEqual(['b'])
  })
})
