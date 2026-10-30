import { groupStates } from '../../../src/explorations/note-grid-sets/group-states'

const counts = [54, 23, 11, 5, 4, 2, 1]
const total = 100

describe('groupStates', () => {
  it.each([
    [720, 320],
    [440, 440],
    [320, 560],
  ])('puts every note in both states, inside the grid (%ix%i)', (width, height) => {
    const { grouped, natural, order } = groupStates(counts, width, height)

    for (const state of [grouped, natural]) {
      expect(state.squares).toHaveLength(total)
      expect(state.squares.every(Boolean)).toBe(true)
      expect(state.columns * state.unit).toBeLessThanOrEqual(width)
      expect(state.rows * state.unit).toBeLessThanOrEqual(height)
      expect(new Set(state.idAt.filter((id) => id !== -1)).size).toBe(total)
    }
    expect(order).toHaveLength(total)
  })

  it('keeps a note in its own set in the grouped state', () => {
    const { grouped, order } = groupStates(counts, 720, 320)

    grouped.idAt.forEach((id, cell) => {
      if (id !== -1) expect(grouped.owner[cell]).toBe(order[id])
    })
  })

  it('has one size of square when not grouped and the natural order of the notes', () => {
    const { natural } = groupStates(counts, 720, 320)

    expect(new Set(natural.squares.map((s) => s.size)).size).toBe(1)
    expect(natural.squares[0]).toEqual({ x: 0, y: 0, size: natural.unit })
    expect(natural.squares[1].x).toBe(natural.unit)
  })

  it('numbers the notes of a set in the order they have in the grouped state', () => {
    const { noteInSet, order } = groupStates(counts, 720, 320)

    expect(noteInSet.filter((_, id) => order[id] === 6)).toEqual([0])
    expect(Math.max(...noteInSet.filter((_, id) => order[id] === 0))).toBe(53)
  })

  it('leaves the cells past the last note empty in a grid that is bigger than the notes', () => {
    const { natural } = groupStates([7], 100, 100)

    expect(natural.idAt.filter((id) => id === -1).length).toBe(natural.columns * natural.rows - 7)
  })
})
