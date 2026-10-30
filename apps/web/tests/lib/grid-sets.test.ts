import { toGridSets, UNTAGGED, type CachedNote, type CachedSet } from '../../src/lib/grid-sets'

const note = (id: string, title?: string): CachedNote => ({
  id,
  fields: title === undefined ? {} : { title },
})
const set = (source: string, id: string, color: number, ...noteIds: string[]): CachedSet => ({
  source,
  id,
  color,
  noteIds,
})

describe('toGridSets', () => {
  it('makes a grid set of each cache set with its colour and its titled notes', () => {
    const result = toGridSets(
      [set('bear', 'daily', 3, 'a', 'b'), set('bear', 'work', 5, 'c')],
      [note('a', 'plan'), note('b'), note('c', 'budget')],
    )

    expect(result).toEqual([
      {
        id: 'bear:daily',
        name: 'daily',
        color: 3,
        notes: [
          { id: 'a', title: 'plan' },
          { id: 'b', title: 'b' },
        ],
      },
      { id: 'bear:work', name: 'work', color: 5, notes: [{ id: 'c', title: 'budget' }] },
    ])
  })

  it('puts the notes in no set in a last grey set', () => {
    const result = toGridSets([set('bear', 'daily', 3, 'a')], [note('a'), note('z', 'loose')])

    expect(result.at(-1)).toEqual({
      id: UNTAGGED,
      name: 'untagged',
      color: 24,
      notes: [{ id: 'z', title: 'loose' }],
    })
    expect(result).toHaveLength(2)
  })

  it('has no untagged set when every note is in a set', () => {
    const result = toGridSets([set('bear', 'daily', 3, 'a')], [note('a')])

    expect(result.map((s) => s.id)).toEqual(['bear:daily'])
  })

  it('makes every note untagged when there are no sets', () => {
    const result = toGridSets([], [note('a'), note('b')])

    expect(result).toHaveLength(1)
    expect(result[0]?.notes).toHaveLength(2)
  })

  it('has nothing for no sets and no notes', () => {
    expect(toGridSets([], [])).toEqual([])
  })

  it('names a set with its source when another source has a set of the same name', () => {
    const result = toGridSets(
      [set('bear', 'daily', 1, 'a'), set('file', 'daily', 2, 'b'), set('bear', 'work', 3, 'c')],
      [note('a'), note('b'), note('c')],
    )

    expect(result.map((s) => s.name)).toEqual(['bear:daily', 'file:daily', 'work'])
    expect(new Set(result.map((s) => s.id)).size).toBe(3)
  })

  it('leaves out ids of notes the cache no longer lists', () => {
    const result = toGridSets([set('bear', 'daily', 1, 'a', 'gone')], [note('a')])

    expect(result[0]?.notes).toEqual([{ id: 'a', title: 'a' }])
  })

  it('keeps a note listed in two sets in the first', () => {
    const result = toGridSets(
      [set('bear', 'x', 1, 'a'), set('bear', 'y', 2, 'a', 'b')],
      [note('a'), note('b')],
    )

    expect(result.map((s) => s.notes.map((n) => n.id))).toEqual([['a'], ['b']])
  })

  it('keeps a set with no notes (the grid leaves it out)', () => {
    const result = toGridSets([set('bear', 'old', 1)], [note('a')])

    expect(result[0]).toMatchObject({ id: 'bear:old', notes: [] })
  })
})
