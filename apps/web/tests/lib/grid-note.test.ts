import { parseTags, toGridNote } from '../../src/lib/grid-note'

const colors = new Map([
  ['work', 3],
  ['home', 7],
  ['ideas', 11],
])

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
  it('colours a note by its tags, in order, and lists them', () => {
    const note = toGridNote({ id: 'a', fields: { title: 'plan', tags: '["home","work"]' } }, colors)

    expect(note).toEqual({ id: 'a', title: 'plan', colors: [7, 3], tags: ['home', 'work'] })
  })

  it('leaves out tags the cache has no colour for, but still lists them', () => {
    const note = toGridNote({ id: 'a', fields: { tags: '["new","work"]' } }, colors)

    expect(note.colors).toEqual([3])
    expect(note.tags).toEqual(['new', 'work'])
  })

  it('titles a note without a title by its id', () => {
    expect(toGridNote({ id: 'untitled', fields: {} }, colors).title).toBe('untitled')
  })

  it('has no colours for a note without tags', () => {
    expect(toGridNote({ id: 'a', fields: { title: 'plan' } }, colors)).toEqual({
      id: 'a',
      title: 'plan',
      colors: [],
      tags: [],
    })
  })

  it('colours a nested tag by its top level and counts a top level once', () => {
    const note = toGridNote(
      {
        id: 'a',
        fields: { title: 'log', tags: '["work/q4","work/q3","home/chores"]' },
      },
      colors,
    )

    expect(note.colors).toEqual([3, 7])
    expect(note.tags).toEqual(['work/q4', 'work/q3', 'home/chores'])
  })
})
