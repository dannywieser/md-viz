import { scaleSets } from '../../../src/explorations/note-grid-sets/scale-sets'

describe('scaleSets', () => {
  it.each([100, 500, 5000])('holds exactly %i notes', (total) => {
    const sets = scaleSets(total)

    expect(sets.reduce((sum, set) => sum + set.count, 0)).toBe(total)
    expect(sets.every((set) => set.count >= 1)).toBe(true)
  })

  it('keeps the sets in the order of the sample, biggest first', () => {
    const counts = scaleSets(500).map((set) => set.count)

    expect(counts).toEqual([...counts].sort((a, b) => b - a))
    expect(scaleSets(500).map((set) => set.name)[0]).toBe('set a')
  })
})
