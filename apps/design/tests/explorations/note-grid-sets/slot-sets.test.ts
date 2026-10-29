import {
  candidateWidths,
  fitContainer,
  slotSets,
} from '../../../src/explorations/note-grid-sets/slot-sets'

describe('candidateWidths', () => {
  it('puts the squarest shapes first', () => {
    expect(candidateWidths(49, 20)[0]).toBe(7)
    expect([7, 8]).toContain(candidateWidths(50, 20)[0])
    expect(candidateWidths(2, 20)).toEqual([1, 2])
  })

  it('never goes wider than the grid or the count', () => {
    expect(Math.max(...candidateWidths(50, 4))).toBe(4)
    expect(candidateWidths(1, 10)).toEqual([1])
  })
})

describe('slotSets', () => {
  it('slots the first set at the top-left in a square shape', () => {
    const slotting = slotSets([9, 4], 10, 10)

    expect(slotting?.slots[0]).toEqual({ x: 0, y: 0, columns: 3, rows: 3, count: 9 })
    expect(slotting?.slots[1]).toMatchObject({ x: 3, y: 0, columns: 2, rows: 2 })
  })

  it('marks every cell of a set as its own', () => {
    const slotting = slotSets([7, 2], 4, 4)

    expect(slotting?.owner.filter((o) => o === 0)).toHaveLength(7)
    expect(slotting?.owner.filter((o) => o === 1)).toHaveLength(2)
  })

  it('lets a smaller set take the short last row of another', () => {
    const slotting = slotSets([7, 2], 3, 3)

    expect(slotting?.slots[1]).toEqual({ x: 1, y: 2, columns: 2, rows: 1, count: 2 })
  })

  it('falls back to a thinner shape when the square does not fit', () => {
    const slotting = slotSets([9], 9, 1)

    expect(slotting?.slots[0]).toMatchObject({ columns: 9, rows: 1 })
  })

  it('is null when a set does not fit', () => {
    expect(slotSets([10], 3, 3)).toBeNull()
    expect(slotSets([5, 5], 3, 3)).toBeNull()
  })
})

describe('fitContainer', () => {
  it('picks a whole-px cell and a grid that fits the box', () => {
    const fit = fitContainer([50, 23, 9], 200, 100)

    expect(Number.isInteger(fit.cell)).toBe(true)
    expect(fit.columns * fit.cell).toBeLessThanOrEqual(200)
    expect(fit.rows * fit.cell).toBeLessThanOrEqual(100)
    expect(fit.owner.filter((o) => o !== -1)).toHaveLength(82)
  })

  it('uses the largest cell at which every set slots', () => {
    const counts = [50, 23, 9]
    const fit = fitContainer(counts, 200, 100)
    const bigger = fit.cell + 1

    expect(slotSets(counts, Math.floor(200 / bigger), Math.floor(100 / bigger))).toBeNull()
  })

  it('grows the grid downward when even 1px cells do not fit', () => {
    const fit = fitContainer([100], 5, 5)

    expect(fit.cell).toBe(1)
    expect(fit.rows).toBeGreaterThan(5)
    expect(fit.slots).toHaveLength(1)
  })
})
