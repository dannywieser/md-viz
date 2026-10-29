import {
  blockAt,
  largestCell,
  packBlocks,
  uniformLayout,
} from '../../../src/explorations/note-grid-sets/pack-blocks'

describe('packBlocks', () => {
  it('places blocks left to right', () => {
    const { placements, rows } = packBlocks(
      [
        { columns: 3, rows: 3 },
        { columns: 2, rows: 2 },
      ],
      10,
    )

    expect(placements.map((p) => [p.x, p.y])).toEqual([
      [0, 0],
      [3, 0],
    ])
    expect(rows).toBe(3)
  })

  it('starts a new row below the tallest block when one does not fit', () => {
    const { placements, rows } = packBlocks(
      [
        { columns: 3, rows: 3 },
        { columns: 2, rows: 2 },
        { columns: 4, rows: 1 },
      ],
      5,
    )

    expect(placements[2]).toMatchObject({ x: 0, y: 3 })
    expect(rows).toBe(4)
  })

  it('keeps a block wider than the grid at the left edge', () => {
    const { placements } = packBlocks(
      [
        { columns: 6, rows: 2 },
        { columns: 6, rows: 2 },
      ],
      4,
    )

    expect(placements.map((p) => [p.x, p.y])).toEqual([
      [0, 0],
      [0, 2],
    ])
  })

  it('packs nothing into no rows', () => {
    expect(packBlocks([], 5)).toEqual({ placements: [], rows: 0 })
  })
})

describe('largestCell', () => {
  const shapes = [
    { columns: 8, rows: 8 },
    { columns: 4, rows: 4 },
  ]

  it('is a whole number of px at which every block fits', () => {
    const cell = largestCell(shapes, 100, 60)

    expect(Number.isInteger(cell)).toBe(true)
    expect(packBlocks(shapes, Math.floor(100 / cell)).rows * cell).toBeLessThanOrEqual(60)
    expect(
      packBlocks(shapes, Math.floor(100 / (cell + 1))).rows * (cell + 1),
    ).toBeGreaterThan(60)
  })

  it('falls back to 1px when nothing fits', () => {
    expect(largestCell(shapes, 4, 4)).toBe(1)
  })
})

describe('blockAt', () => {
  const placements = [
    { x: 0, y: 0, columns: 3, rows: 3 },
    { x: 3, y: 0, columns: 2, rows: 2 },
  ]

  it('finds the block under a cell', () => {
    expect(blockAt(placements, 1, 2)).toBe(0)
    expect(blockAt(placements, 4, 1)).toBe(1)
  })

  it('is -1 outside every block', () => {
    expect(blockAt(placements, 4, 2)).toBe(-1)
  })
})

describe('uniformLayout', () => {
  it('picks the largest cell at which the notes fit', () => {
    const { columns, rows, cell } = uniformLayout(20, 100, 100)

    expect(columns * rows).toBeGreaterThanOrEqual(20)
    expect(rows * cell).toBeLessThanOrEqual(100)
    expect(Math.ceil(20 / Math.max(1, Math.floor(100 / (cell + 1)))) * (cell + 1)).toBeGreaterThan(
      100,
    )
  })

  it('overflows with 1px cells rather than dropping notes', () => {
    expect(uniformLayout(50, 4, 4)).toEqual({ columns: 4, rows: 13, cell: 1 })
  })
})
