import {
  fillTileLayout,
  idealScales,
  placeTiles,
  tileLayout,
} from '../../../src/explorations/note-grid-sets/tile-layout'

const counts = [54, 23, 11, 5, 4, 2, 1]

describe('idealScales', () => {
  it('is 1 for the biggest set and grows for the smaller ones when softened', () => {
    const ideal = idealScales(counts, 0.5)

    expect(ideal[0]).toBeCloseTo(1)
    expect(ideal[6]).toBeGreaterThan(ideal[3])
    expect(ideal[3]).toBeGreaterThan(1)
  })

  it('is the same for every set when the share is by notes', () => {
    for (const s of idealScales(counts, 1)) expect(s).toBeCloseTo(1)
  })
})

describe('placeTiles', () => {
  it('fills every unit cell with the notes of the sets, none twice', () => {
    const fit = placeTiles([4, 3], [1, 2], 4, 4)

    expect(fit.tiles).toHaveLength(7)
    expect(fit.owner.every((o) => o !== -1)).toBe(true)
    expect(fit.owner.filter((o) => o === 0)).toHaveLength(4)
    expect(fit.owner.filter((o) => o === 1)).toHaveLength(12)
  })

  it('leaves cells empty when the grid is bigger than the squares', () => {
    const fit = placeTiles([1], [1], 2, 2)

    expect(fit.owner.filter((o) => o === -1)).toHaveLength(3)
    expect(fit.tileAt.filter((t) => t === -1)).toHaveLength(3)
  })

  it('numbers the notes of a set from 0 in the order they are placed', () => {
    const fit = placeTiles([4], [1], 2, 2)

    expect(fit.tiles.map((t) => t.note)).toEqual([0, 1, 2, 3])
  })
})

describe('tileLayout', () => {
  it.each([0, 0.5, 1])('fills the whole grid with no filler (share %s)', (exponent) => {
    for (const [width, height] of [
      [720, 320],
      [440, 440],
      [320, 560],
    ]) {
      const fit = tileLayout(counts, exponent, width, height)

      expect(fit.owner.every((o) => o !== -1)).toBe(true)
      expect(fit.tiles).toHaveLength(counts.reduce((a, b) => a + b, 0))
      expect(fit.columns * fit.unit).toBeLessThanOrEqual(width)
      expect(fit.rows * fit.unit).toBeLessThanOrEqual(height)
      expect(fit.unit).toBeGreaterThanOrEqual(3)
    }
  })

  it('gives the smaller sets bigger squares when softened', () => {
    const fit = tileLayout(counts, 0.5, 720, 320)

    expect(fit.scales[6]).toBeGreaterThan(fit.scales[0])
    expect(fit.scales.every((s) => Number.isInteger(Math.log2(s)))).toBe(true)
  })

  it('falls back to a grid with a few empty cells when no exact fit has a usable unit', () => {
    const fit = tileLayout([7, 1], 0.5, 40, 40)

    expect(fit.tiles).toHaveLength(8)
    expect(fit.unit).toBeGreaterThanOrEqual(1)
  })
})

describe('fillTileLayout', () => {
  it('fills an odd window within one unit, with only a few cells empty', () => {
    const fit = fillTileLayout(counts, 0, 901, 477)

    expect(901 - fit.columns * fit.unit).toBeLessThan(fit.unit * 2)
    expect(fit.tiles).toHaveLength(100)
    expect(fit.owner.filter((o) => o === -1).length / fit.owner.length).toBeLessThan(0.15)
  })

  it.each([
    [720, 320],
    [440, 440],
  ])('fills the box with every cell a note, within one unit (%ix%i)', (width, height) => {
    const fit = fillTileLayout(counts, 0, width, height)

    expect(fit.owner.every((o) => o !== -1)).toBe(true)
    expect(width - fit.columns * fit.unit).toBeLessThan(fit.unit)
    expect(height - fit.rows * fit.unit).toBeLessThan(fit.unit)
    expect(fit.tiles).toHaveLength(100)
  })

  it('falls back to the rounded sizes with empty cells when nothing fits exactly', () => {
    const fit = fillTileLayout([7, 1], 0.5, 40, 40)

    expect(fit.tiles).toHaveLength(8)
  })

  it('falls back to a one px unit on a box too small for anything else', () => {
    const fit = fillTileLayout([30, 1], 0, 3, 3)

    expect(fit.unit).toBe(1)
    expect(fit.tiles).toHaveLength(31)
  })
})
