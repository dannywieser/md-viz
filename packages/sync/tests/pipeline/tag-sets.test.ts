import { buildTagSets } from '../../src/pipeline/tag-sets'

describe('buildTagSets', () => {
  it('makes a set per top-level tag, ordered by id, with the notes that have it', () => {
    const sets = buildTagSets(
      [
        { id: 'a', tags: ['work', 'daily/10/28'] },
        { id: 'b', tags: ['daily/10/29', 'daily'] },
        { id: 'c', tags: [] },
      ],
      [],
    )

    expect(sets).toEqual([
      { id: 'daily', rank: 0, noteIds: ['a', 'b'] },
      { id: 'work', rank: 0, noteIds: ['a'] },
    ])
  })

  it('lists a note once in a set however many of its tags share the top level', () => {
    const [set] = buildTagSets([{ id: 'a', tags: ['x/1', 'x/2', 'x'] }], [])

    expect(set?.noteIds).toEqual(['a'])
  })

  it('returns a known tag no note has any more as an empty set', () => {
    const sets = buildTagSets([{ id: 'a', tags: ['new'] }], ['old', 'new'])

    expect(sets).toEqual([
      { id: 'new', rank: 0, noteIds: ['a'] },
      { id: 'old', rank: 0, noteIds: [] },
    ])
  })

  it('returns no sets for no notes and no known tags', () => {
    expect(buildTagSets([], [])).toEqual([])
  })
})
