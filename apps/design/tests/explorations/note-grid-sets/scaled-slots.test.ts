import {
  blockSide,
  notesArea,
  scaleLayout,
  spaceShares,
} from '../../../src/explorations/note-grid-sets/scaled-slots'

const counts = [55, 23, 10, 5, 4, 2, 1]

describe('spaceShares', () => {
  it('adds up to one', () => {
    for (const exponent of [0, 0.5, 1]) {
      const sum = spaceShares(counts, exponent).reduce((a, b) => a + b, 0)
      expect(sum).toBeCloseTo(1)
    }
  })

  it('is by notes at 1 and the same for every set at 0', () => {
    expect(spaceShares([3, 1], 1)).toEqual([0.75, 0.25])
    expect(spaceShares([3, 1], 0)).toEqual([0.5, 0.5])
  })
})

describe('blockSide', () => {
  it('is the side of the smallest square block that holds the notes', () => {
    expect([1, 2, 4, 5, 9, 10].map(blockSide)).toEqual([1, 2, 2, 3, 3, 4])
  })
})

describe('scaleLayout', () => {
  it('makes every set a full square block', () => {
    const fit = scaleLayout(counts, 0.5, 720, 320)

    counts.forEach((count, i) => {
      const { columns, rows } = fit.slots[i]
      expect(columns).toBe(rows)
      expect(columns ** 2).toBeGreaterThanOrEqual(count)
    })
  })

  it('places every set without overlap, on whole units', () => {
    const fit = scaleLayout(counts, 0.5, 720, 320)

    expect(Number.isInteger(fit.unit)).toBe(true)
    expect(fit.columns * fit.unit).toBeLessThanOrEqual(720)
    expect(fit.rows * fit.unit).toBeLessThanOrEqual(320)
    counts.forEach((count, i) => {
      const cells = fit.owner.filter((o) => o === i).length
      expect(cells).toBe(count * fit.slots[i].scale ** 2)
    })
  })

  it('gives small sets bigger squares when their share is bigger than their notes', () => {
    const fit = scaleLayout(counts, 0, 720, 320)

    expect(fit.slots[6].scale).toBeGreaterThan(fit.slots[0].scale)
  })

  it('uses the free space: the notes cover most of the container', () => {
    for (const exponent of [0, 0.5, 1]) {
      const fit = scaleLayout(counts, exponent, 720, 320)

      expect(notesArea(counts, fit) / (720 * 320)).toBeGreaterThan(0.6)
    }
  })

  it('never overlaps after growing', () => {
    const fit = scaleLayout(counts, 1, 720, 320)

    counts.forEach((count, i) => {
      expect(fit.owner.filter((o) => o === i).length).toBe(count * fit.slots[i].scale ** 2)
    })
  })

  it('keeps the unit big enough for the empty gridlines to show', () => {
    for (const exponent of [0, 0.5, 1]) {
      const sets = [2740, 1142, 525, 274, 205, 91, 23]

      expect(scaleLayout(sets, exponent, 440, 440).unit).toBeGreaterThanOrEqual(3)
    }
  })

  it('falls back to one unit when nothing can be placed', () => {
    const fit = scaleLayout([5], 1, 0, 0)

    expect(fit.slots).toEqual([])
    expect(fit.unit).toBe(1)
  })
})
