import {
  SAMPLE_NOTES,
  SAMPLE_SETS,
  SAMPLE_TAGS,
  SET_COLOR,
  TAG_COLOR,
  setCount,
} from '../../../src/explorations/note-grid-sets/sample-sets'

describe('sample sets', () => {
  it('has generic sets from big to a single note', () => {
    expect(SAMPLE_SETS.map((set) => set.name)).toEqual([
      'set a',
      'set b',
      'set c',
      'set d',
      'set e',
      'set f',
      'set g',
    ])
    expect(SAMPLE_SETS.map((set) => setCount(set.id))).toEqual([120, 50, 23, 12, 9, 4, 1])
  })

  it('gives every note exactly one own set and unique ids', () => {
    expect(SAMPLE_NOTES).toHaveLength(219)
    expect(new Set(SAMPLE_NOTES.map((note) => note.id)).size).toBe(219)
    for (const note of SAMPLE_NOTES) expect(SET_COLOR[note.sets[0]]).toBeDefined()
  })

  it('puts some notes in several sets and leaves some without tags', () => {
    expect(SAMPLE_NOTES.some((note) => note.sets.length === 2)).toBe(true)
    expect(SAMPLE_NOTES.some((note) => note.sets.length === 3)).toBe(true)
    expect(SAMPLE_NOTES.some((note) => note.tags.length === 0)).toBe(true)
    expect(SAMPLE_NOTES.some((note) => note.tags.length === 3)).toBe(true)
  })

  it('only uses known tags and sets', () => {
    for (const note of SAMPLE_NOTES) {
      for (const tag of note.tags) expect(SAMPLE_TAGS).toContain(tag)
      for (const id of note.sets) expect(SET_COLOR[id]).toBeDefined()
    }
    expect(Object.keys(TAG_COLOR)).toEqual(SAMPLE_TAGS)
  })
})
