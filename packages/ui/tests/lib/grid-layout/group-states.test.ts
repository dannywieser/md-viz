import { groupStates } from '../../../src/lib/grid-layout/group-states'

// natural order: set per note, mixed
const order = [0, 1, 0, 0, 2, 0, 1, 0, 0, 0]
const counts = [7, 2, 1]

describe('groupStates', () => {
  const states = groupStates(counts, order, 200, 120)

  it('fills the same frame in both states', () => {
    for (const state of [states.grouped, states.natural]) {
      expect(state.x0 * 2 + state.columns * state.unit).toBeLessThanOrEqual(200)
      expect(state.y0 * 2 + state.rows * state.unit).toBeLessThanOrEqual(120)
      expect(state.squares).toHaveLength(10)
    }
    expect(states.width).toBe(200)
    expect(states.height).toBe(120)
  })

  it('gives every note one square in the natural state, in the order listed', () => {
    const { natural } = states

    expect(new Set(natural.squares.map((s) => s.size))).toEqual(new Set([natural.unit]))
    expect(natural.squares[0]).toEqual({ x: 0, y: 0, size: natural.unit })
    expect(natural.idAt.slice(0, 10)).toEqual(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].slice(0, natural.columns * natural.rows),
    )
  })

  it('marks the cells past the last note empty', () => {
    const few = groupStates([5], [0, 0, 0, 0, 0], 100, 60)

    expect(few.natural.idAt.filter((id) => id === -1).length).toBeGreaterThan(0)
  })

  it('gives a smaller set bigger squares when grouped', () => {
    const { grouped } = states

    expect(grouped.squares[4].size).toBeGreaterThan(grouped.squares[0].size)
  })

  it('maps the cells of the grouped state back to the notes, each note once', () => {
    const ids = states.grouped.idAt.filter((id) => id !== -1)

    expect(new Set(ids)).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
  })

  it('keeps the notes of a set in their natural order inside its shape', () => {
    const set1 = [1, 6]
    const [a, b] = set1.map((id) => states.grouped.squares[id])

    expect(a.x + a.y).toBeLessThanOrEqual(b.x + b.y + b.size * 100)
  })

  it('draws the outline of the shapes', () => {
    expect(states.grouped.outline.startsWith('M')).toBe(true)
  })

  it('leaves empty cells out of the grouped idAt', () => {
    const odd = groupStates([7, 3], [0, 0, 0, 0, 0, 0, 0, 1, 1, 1], 101, 67)

    expect(odd.grouped.idAt.some((id) => id === -1)).toBe(odd.grouped.idAt.length > 10)
  })
})
