import { fillGrid, ownerOutline } from '../../../src/lib/grid-layout/grid-geometry'

describe('fillGrid', () => {
  it('picks the biggest whole-px square that holds every note and fills the box', () => {
    const { cell, columns, rows } = fillGrid(100, 200, 100)

    expect(columns * rows).toBeGreaterThanOrEqual(100)
    expect(columns * cell).toBeLessThanOrEqual(200)
    expect(rows * cell).toBeLessThanOrEqual(100)
    const bigger = cell + 1
    expect(Math.floor(200 / bigger) * Math.floor(100 / bigger)).toBeLessThan(100)
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
