import { parseTags, toGridNote } from '../../src/lib/grid-note'

describe('parseTags', () => {
  it('reads the JSON array of tags', () => {
    expect(parseTags('["work","home"]')).toEqual(['work', 'home'])
  })

  it('is no tags when the field is missing', () => {
    expect(parseTags(undefined)).toEqual([])
  })

  it.each([
    ['not json', 'oops'],
    ['not a list', '{"a":1}'],
  ])('is no tags when the field is %s', (_name, value) => {
    expect(parseTags(value)).toEqual([])
  })

  it('keeps only the strings', () => {
    expect(parseTags('["a",1,null,"b"]')).toEqual(['a', 'b'])
  })
})

describe('toGridNote', () => {
  it('lists the tags of a note, in order, without colours', () => {
    const note = toGridNote({ id: 'a', fields: { title: 'plan', tags: '["home","work/q4"]' } })

    expect(note).toEqual({ id: 'a', title: 'plan', colors: [], tags: ['home', 'work/q4'] })
  })

  it('titles a note without a title by its id', () => {
    expect(toGridNote({ id: 'untitled', fields: {} }).title).toBe('untitled')
  })

  it('has no tags for a note without tags', () => {
    expect(toGridNote({ id: 'a', fields: { title: 'plan' } })).toEqual({
      id: 'a',
      title: 'plan',
      colors: [],
      tags: [],
    })
  })
})
