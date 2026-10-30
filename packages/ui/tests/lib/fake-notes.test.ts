import { HUE_COLORS, makeFakeSets } from '../../src'

describe('makeFakeSets', () => {
  it('makes a set for each count with that many notes and unique note ids across all of them', () => {
    const sets = makeFakeSets([40, 5, 1])

    expect(sets.map((set) => set.notes.length)).toEqual([40, 5, 1])
    const ids = sets.flatMap((set) => set.notes.map((note) => note.id))
    expect(new Set(ids).size).toBe(46)
  })

  it('gives the sets names and palette colours of their own', () => {
    const sets = makeFakeSets([3, 3, 3])

    expect(new Set(sets.map((set) => set.name)).size).toBe(3)
    expect(sets.map((set) => set.color)).toEqual([0, 1, 2])
  })

  it('wraps the colours past the palette and numbers repeated names', () => {
    const sets = makeFakeSets(Array.from({ length: HUE_COLORS + 40 }, () => 1))

    expect(sets[HUE_COLORS]?.color).toBe(0)
    expect(sets[40]?.name).toMatch(/ 2$/)
    expect(new Set(sets.map((set) => set.name)).size).toBe(sets.length)
  })

  it('gives every note a lowercase two-word title', () => {
    for (const set of makeFakeSets([100])) {
      for (const note of set.notes) expect(note.title).toMatch(/^[a-z]+ [a-z]+$/)
    }
  })

  it('is the same every time and empty for no counts', () => {
    expect(makeFakeSets([4, 2])).toEqual(makeFakeSets([4, 2]))
    expect(makeFakeSets([])).toEqual([])
  })
})
