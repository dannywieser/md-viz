import {
  fillTileLayout,
  idealScales,
  MAX_TILED_SETS,
  placeTiles,
} from '../../../src/lib/grid-layout/tile-layout'

const area = (counts: number[], scales: number[]) =>
  counts.reduce((sum, count, i) => sum + count * scales[i] ** 2, 0)

describe('idealScales', () => {
  it('gives the set with the least space per note scale 1 and the others bigger squares', () => {
    const [big, small] = idealScales([100, 4])

    expect(big).toBe(1)
    expect(small).toBeCloseTo(5, 5)
  })

  it('gives sets of equal size the same scale', () => {
    expect(idealScales([10, 10, 10])).toEqual([1, 1, 1])
  })
})

describe('placeTiles', () => {
  it('places every note of every set on its own tile without overlap', () => {
    const fit = placeTiles([6, 3], [1, 2], 6, 6)

    expect(fit.tiles).toHaveLength(9)
    const covered = fit.owner.filter((o) => o !== -1).length
    expect(covered).toBe(area([6, 3], [1, 2]))
    expect(fit.tileAt.every((t) => t === -1 || t < 9)).toBe(true)
  })

  it('places the set with the bigger squares first', () => {
    const fit = placeTiles([4, 1], [1, 2], 4, 4)

    expect(fit.tiles[0]).toMatchObject({ set: 1, size: 2, x: 0, y: 0 })
  })

  it('carries on in the space the previous set left, so a set is one shape', () => {
    const fit = placeTiles([5], [1], 3, 2)

    expect(fit.tiles.map((t) => [t.x, t.y])).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
      [2, 0],
    ])
  })

  it('skips a free rectangle too small for a size and uses it for a smaller set', () => {
    const fit = placeTiles([3, 1], [2, 1], 5, 2)

    expect(fit.tiles.filter((t) => t.set === 0)).toHaveLength(2)
    expect(fit.tiles.find((t) => t.set === 1)).toMatchObject({ x: 4, y: 0, size: 1 })
  })
})

describe('placeTiles under the squares', () => {
  it('gives the strip under a full column of big squares to the next set', () => {
    // two squares of 2 fill 4 of the 5 rows of the first two columns; the row below is free
    const fit = placeTiles([2, 4], [2, 1], 4, 5)

    expect(fit.tiles.filter((tile) => tile.set === 1)).toHaveLength(4)
    const below = fit.tiles.filter((tile) => tile.set === 1 && tile.x < 2 && tile.y === 4)
    expect(below.length).toBeGreaterThan(0)
  })
})

describe('fillTileLayout', () => {
  const empty = (fit: ReturnType<typeof fillTileLayout>) =>
    fit.columns * fit.rows - fit.tiles.reduce((sum, tile) => sum + tile.size ** 2, 0)

  it('gives a small set much bigger squares than a huge one, with hardly any cell left empty', () => {
    for (const [width, height] of [
      [880, 400],
      [880, 260],
      [711, 296],
    ]) {
      const fit = fillTileLayout([2, 4862], width, height)

      expect(fit.scales[0]).toBeGreaterThan(fit.scales[1])
      expect(fit.tiles).toHaveLength(4864)
      expect(empty(fit)).toBeLessThan(100)
      expect(fit.columns * fit.unit).toBeLessThanOrEqual(width)
      expect(fit.rows * fit.unit).toBeLessThanOrEqual(height)
    }
  })

  it('has only as many rows as the notes need, so the grid is as short as it can be', () => {
    const fit = fillTileLayout([2, 4862], 880, 400)

    expect(fit.rows * fit.unit).toBeLessThan(400)
    expect(fit.columns * (fit.rows - 1)).toBeLessThan(5374)
  })

  it('makes the squares as big as the box allows for the sizes it picks', () => {
    const fit = fillTileLayout([60, 20, 5], 400, 300)
    const bigger = fit.unit + 1
    const area = fit.tiles.reduce((sum, tile) => sum + tile.size ** 2, 0)

    expect(Math.floor(400 / bigger) * Math.floor(300 / bigger)).toBeLessThan(area)
    expect(fit.scales[2]).toBeGreaterThanOrEqual(fit.scales[0])
    expect(fit.tiles).toHaveLength(85)
  })

  it('lays one set out as a plain grid', () => {
    const fit = fillTileLayout([12], 120, 90)

    expect(fit.tiles).toHaveLength(12)
    expect(fit.scales).toEqual([1])
    expect(empty(fit)).toBeLessThan(fit.columns)
  })

  it('places every note of every set once', () => {
    const fit = fillTileLayout([7, 3, 1], 101, 67)

    expect(fit.tiles).toHaveLength(11)
    expect(new Set(fit.tiles.map((tile) => `${tile.set}:${tile.note}`)).size).toBe(11)
  })

  it('keeps the sizes of the sets it searches over a whole range of box sizes', () => {
    for (const width of [300, 500, 700, 900]) {
      for (const height of [150, 250, 350]) {
        const fit = fillTileLayout([300, 120, 40, 6, 1], width, height)

        expect(fit.tiles).toHaveLength(467)
        expect(fit.columns * fit.unit).toBeLessThanOrEqual(width)
        expect(fit.rows * fit.unit).toBeLessThanOrEqual(height)
      }
    }
  })

  it('uses one-unit squares when the box is too small for squares of 3px', () => {
    const fit = fillTileLayout([20, 5], 12, 10)

    expect(fit.scales).toEqual([1, 1])
    expect(fit.tiles).toHaveLength(25)
    expect(fit.columns * fit.rows).toBeGreaterThanOrEqual(25)
  })

  it('uses 1px squares in a tall strip when even that does not fit', () => {
    const fit = fillTileLayout([30, 30], 4, 4)

    expect(fit.unit).toBe(1)
    expect(fit.tiles).toHaveLength(60)
  })

  it('does not search for sizes above the set limit: all squares have one size', () => {
    const counts = Array.from({ length: MAX_TILED_SETS + 1 }, (_, i) => 5 + i * 3)
    const fit = fillTileLayout(counts, 400, 300)

    expect(new Set(fit.scales)).toEqual(new Set([1]))
    expect(fit.tiles).toHaveLength(counts.reduce((sum, count) => sum + count, 0))
  })

  it('stays fast with the most sets it still searches', () => {
    const counts = Array.from({ length: MAX_TILED_SETS }, (_, i) => 1 + ((i * 37) % 400) + 20)
    const started = performance.now()
    fillTileLayout(counts, 880, 440)

    expect(performance.now() - started).toBeLessThan(2000)
  })
})
