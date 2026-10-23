import { gridBlockSize, latticeSpacing, layoutGrid } from '../../src/lib/note-grid-layout'

const box = { width: 400, height: 300 }

describe('layoutGrid', () => {
  it('gives fewer notes bigger cells', () => {
    const few = layoutGrid({ count: 5, ...box })
    const many = layoutGrid({ count: 5000, ...box })

    expect(few.cell).toBeGreaterThan(many.cell)
  })

  it.each([1, 5, 50, 500, 5000])('fits all %i notes in the box', (count) => {
    const { columns, rows, cell } = layoutGrid({ count, ...box })

    expect(columns * rows).toBeGreaterThanOrEqual(count)
    expect(columns * cell).toBeLessThanOrEqual(box.width)
    expect(rows * cell).toBeLessThanOrEqual(box.height)
  })

  it('uses whole pixels', () => {
    expect(Number.isInteger(layoutGrid({ count: 137, ...box }).cell)).toBe(true)
  })

  it('makes five notes large cells', () => {
    const { cell, columns, rows } = layoutGrid({ count: 5, ...box })

    expect(cell).toBeGreaterThanOrEqual(100)
    expect(columns * rows).toBeLessThan(5 + columns)
  })

  it('honours an optional cap', () => {
    expect(layoutGrid({ count: 1, ...box }).cell).toBe(300)
    expect(layoutGrid({ count: 1, ...box, maxCell: 32 }).cell).toBe(32)
  })

  it('handles an empty set and a degenerate box', () => {
    expect(layoutGrid({ count: 0, ...box }).rows).toBe(0)
    expect(layoutGrid({ count: 10, width: 0, height: 0 }).cell).toBe(1)
  })

  it('overflows the height instead of dropping notes when 1px cells cannot fit', () => {
    const { columns, rows, cell } = layoutGrid({ count: 1000, width: 10, height: 10 })

    expect(cell).toBe(1)
    expect(columns * rows).toBeGreaterThanOrEqual(1000)
  })
})

describe('layoutGrid with multipleOf', () => {
  it('uses the largest whole multiple that fits', () => {
    const { cell, columns, rows } = layoutGrid({ count: 50, ...box, multipleOf: 16 })

    expect(cell % 16).toBe(0)
    expect(columns * cell).toBeLessThanOrEqual(box.width)
    expect(rows * cell).toBeLessThanOrEqual(box.height)
    expect(layoutGrid({ count: 50, ...box }).cell).toBeGreaterThanOrEqual(cell)
  })

  it('falls back to any whole pixel when not even one multiple fits', () => {
    const { cell, columns, rows } = layoutGrid({ count: 5000, ...box, multipleOf: 16 })

    expect(cell).toBe(layoutGrid({ count: 5000, ...box }).cell)
    expect(columns * rows).toBeGreaterThanOrEqual(5000)
  })
})

describe('latticeSpacing', () => {
  it('divides large cells evenly so the dots stay close together', () => {
    expect(latticeSpacing(32)).toBe(32)
    expect(latticeSpacing(64)).toBe(32)
    expect(latticeSpacing(167)).toBeCloseTo(167 / 6)
    expect(latticeSpacing(167)).toBeLessThanOrEqual(32)
  })

  it('is the cell itself from the base up and a whole multiple below it', () => {
    expect(latticeSpacing(16)).toBe(16)
    expect(latticeSpacing(24)).toBe(24)
    expect(latticeSpacing(6)).toBe(18)
    expect(latticeSpacing(1)).toBe(16)
  })
})

describe('gridBlockSize', () => {
  it('is the block 18 notes make in the sync column: 6 x 3 cells of 44px plus the stroke room', () => {
    expect(gridBlockSize({ count: 18, width: 272, height: 160 })).toEqual({
      width: 267,
      height: 135,
    })
  })

  it('does not go negative in an area smaller than the stroke room', () => {
    expect(gridBlockSize({ count: 1, width: 0, height: 0 })).toEqual({ width: 4, height: 4 })
  })
})
