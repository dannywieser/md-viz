import { buildTagSets } from '../../src/pipeline/tag-sets'

describe('buildTagSets', () => {
  it("puts a note only in the set of its first tag, by that tag's top level, ordered by id", () => {
    const sets = buildTagSets(
      [
        { id: 'a', tags: ['work', 'daily/10/28'] },
        { id: 'b', tags: ['daily/10/29', 'daily'] },
        { id: 'c', tags: [] },
        { id: 'd', tags: ['daily/11', 'work'] },
      ],
      [],
    )

    expect(sets).toEqual([
      { id: 'daily', rank: 0, noteIds: ['b', 'd'] },
      { id: 'work', rank: 0, noteIds: ['a'] },
    ])
  })

  it('leaves a note without tags out of every set', () => {
    expect(buildTagSets([{ id: 'a', tags: [] }], [])).toEqual([])
  })

  it('uses the whole tag as the set of a tag that starts with a slash', () => {
    expect(buildTagSets([{ id: 'a', tags: ['/odd/tag'] }], [])).toEqual([
      { id: '/odd/tag', rank: 0, noteIds: ['a'] },
    ])
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
