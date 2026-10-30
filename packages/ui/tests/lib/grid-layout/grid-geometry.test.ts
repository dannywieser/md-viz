import { divisorsOf, fillGrid, ownerOutline } from '../../../src/lib/grid-layout/grid-geometry'

describe('divisorsOf', () => {
  it('lists the divisors biggest first', () => {
    expect(divisorsOf(12)).toEqual([12, 6, 4, 3, 2, 1])
    expect(divisorsOf(13)).toEqual([13, 1])
  })
})

describe('fillGrid', () => {
  it('holds every note in the box, in only as many rows as it needs', () => {
    const { cell, columns, rows } = fillGrid(100, 200, 100)

    expect(columns * rows).toBeGreaterThanOrEqual(100)
    expect(columns * (rows - 1)).toBeLessThan(100)
    expect(columns * cell).toBeLessThanOrEqual(200)
    expect(rows * cell).toBeLessThanOrEqual(100)
  })

  it('is exactly as wide as the box when a cell that divides the width is not much smaller', () => {
    const { cell, columns } = fillGrid(50, 880, 300)

    expect(columns * cell).toBe(880)
  })

  it('uses the biggest cell when the one that divides the width is much smaller', () => {
    // 887 is prime: only cells of 1 and 887 divide it
    const { cell, columns } = fillGrid(50, 887, 300)

    expect(cell).toBeGreaterThan(20)
    expect(columns * cell).toBeLessThanOrEqual(887)
  })

  it('leaves the cells past the last note empty', () => {
    const { columns, rows } = fillGrid(5, 100, 100)

    expect(columns * rows).toBeGreaterThanOrEqual(5)
  })

  it('falls back to 1px squares in as many rows as needed when the box is too small', () => {
    expect(fillGrid(50, 4, 4)).toEqual({ cell: 1, columns: 4, rows: 13 })
  })
})

describe('ownerOutline', () => {
  it('is empty for a single set that fills the grid', () => {
    expect(ownerOutline([0, 0, 0, 0], 2, 2, 10)).toBe('M0,0V20M20,0V20M0,0H20M0,20H20')
  })

  it('draws the edge between two sets, as well as the border of each', () => {
    const path = ownerOutline([0, 1], 2, 1, 10)

    expect(path).toContain('M10,0V10')
  })

  it('does not draw the edge around empty cells that touch nothing', () => {
    expect(ownerOutline([-1, -1], 2, 1, 10)).toBe('')
  })

  it('draws the edge between a set and an empty cell', () => {
    expect(ownerOutline([0, -1], 2, 1, 10)).toContain('M10,0V10')
  })
})
