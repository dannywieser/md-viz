import {
  chooseGrid,
  fillGrid,
  flowLayout,
  ownerOutline,
} from '../../../src/explorations/note-grid-sets/flow-layout'

const counts = [54, 23, 11, 5, 4, 2, 1]

function connected(fit: ReturnType<typeof flowLayout>, set: number) {
  const cells = fit.owner.flatMap((o, i) => (o === set ? [i] : []))
  const seen = new Set([cells[0]])
  const queue = [cells[0]]
  while (queue.length) {
    const i = queue.pop() as number
    const x = i % fit.columns
    for (const j of [
      i - fit.columns,
      i + fit.columns,
      x > 0 ? i - 1 : -1,
      x < fit.columns - 1 ? i + 1 : -1,
    ])
      if (fit.owner[j] === set && !seen.has(j)) {
        seen.add(j)
        queue.push(j)
      }
  }
  return seen.size === cells.length
}

describe('chooseGrid', () => {
  it('uses a pair of whole numbers whose product is the number of notes', () => {
    for (const total of [100, 500, 5000]) {
      const { columns, rows } = chooseGrid(total, 720, 320)

      expect(columns * rows).toBe(total)
    }
  })

  it('picks the biggest square that fits the box', () => {
    expect(chooseGrid(100, 720, 320)).toEqual({ cell: 36, columns: 20, rows: 5 })
  })

  it('falls back to a nearly square grid when no pair gives a usable square', () => {
    const { columns, rows } = chooseGrid(97, 300, 300)

    expect(columns * rows).toBeGreaterThanOrEqual(97)
    expect(columns * rows - 97).toBeLessThan(columns)
  })
})

describe('flowLayout', () => {
  it.each([false, true])(
    'fills every cell and keeps each set whole and connected (rows: %s)',
    (byRows) => {
      const fit = flowLayout(counts, 720, 320, byRows)

      expect(fit.owner.every((o) => o !== -1)).toBe(true)
      counts.forEach((count, set) => {
        expect(fit.owner.filter((o) => o === set)).toHaveLength(count)
        expect(connected(fit, set)).toBe(true)
      })
    },
  )

  it('numbers the notes of a set from 0', () => {
    const fit = flowLayout(counts, 720, 320)

    expect(Math.max(...fit.note.filter((_, i) => fit.owner[i] === 0))).toBe(53)
    expect(fit.note.filter((_, i) => fit.owner[i] === 6)).toEqual([0])
  })
})

describe('ownerOutline', () => {
  it('draws the box of a single set and the edge between two sets', () => {
    expect(ownerOutline([0], 1, 1, 10)).toBe('M0,0V10M10,0V10M0,0H10M0,10H10')
    const two = ownerOutline([0, 1], 2, 1, 10)

    expect(two).toContain('M10,0V10')
  })

  it('draws nothing around empty cells', () => {
    expect(ownerOutline([-1, -1], 2, 1, 10)).toBe('')
  })
})

describe('fillGrid', () => {
  it('fills the box within one square and holds all the notes', () => {
    const { cell, columns, rows } = fillGrid(100, 720, 320)

    expect(columns * rows).toBeGreaterThanOrEqual(100)
    expect(720 - columns * cell).toBeLessThan(cell)
    expect(320 - rows * cell).toBeLessThan(cell)
  })

  it('uses a one px cell when the box is too small to do better', () => {
    expect(fillGrid(20, 4, 4).cell).toBe(1)
  })
})
