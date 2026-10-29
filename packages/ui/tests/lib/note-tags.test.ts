import { tagColorIndexes, topLevelTag } from '../../src/lib/note-tags'

describe('topLevelTag', () => {
  it('is the first part of a nested tag', () => {
    expect(topLevelTag('daily/10/28')).toBe('daily')
    expect(topLevelTag('work/q4')).toBe('work')
  })

  it('is a plain tag as it is', () => {
    expect(topLevelTag('ideas')).toBe('ideas')
  })

  it('keeps a tag that starts with a slash whole', () => {
    expect(topLevelTag('/odd')).toBe('/odd')
  })
})

describe('tagColorIndexes', () => {
  const colors: Record<string, number> = { daily: 3, work: 7 }
  const colorOf = (tag: string) => colors[tag]

  it('looks each tag up by its top level', () => {
    expect(tagColorIndexes(['daily/10/28', 'work'], colorOf)).toEqual([3, 7])
  })

  it('counts a top-level tag once, however many of its nested tags there are', () => {
    expect(tagColorIndexes(['daily/10/28', 'daily/10/29', 'work/q4', 'daily'], colorOf)).toEqual([
      3, 7,
    ])
  })

  it('leaves out tags without a colour', () => {
    expect(tagColorIndexes(['new', 'daily/1'], colorOf)).toEqual([3])
  })

  it('has no colours for no tags', () => {
    expect(tagColorIndexes([], colorOf)).toEqual([])
  })
})
