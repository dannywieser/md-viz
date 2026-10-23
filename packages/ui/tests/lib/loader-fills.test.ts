import { loaderFills } from '../../src/lib/loader-fills'

describe('loaderFills', () => {
  it.each(loaderFills.map((variant) => [variant.id, variant] as const))(
    '%s ranks every cell once',
    (_id, variant) => {
      const ranks = variant.rank(8, 6)

      expect([...ranks].sort((a, b) => a - b)).toEqual(Array.from({ length: 48 }, (_, i) => i))
    },
  )

  it('fills rows from the bottom left', () => {
    const ranks = loaderFills.find((v) => v.id === 'rows')!.rank(3, 2)

    expect(ranks).toEqual([3, 4, 5, 0, 1, 2])
  })

  it('fills columns bottom up, left to right', () => {
    const ranks = loaderFills.find((v) => v.id === 'columns')!.rank(3, 2)

    expect(ranks).toEqual([1, 3, 5, 0, 2, 4])
  })

  it('scatters with a step coprime to the cell count', () => {
    const ranks = loaderFills.find((v) => v.id === 'scatter')!.rank(4, 3)

    expect(new Set(ranks).size).toBe(12)
    expect(ranks[1]).not.toBe(1)
  })

  it('drops squares so each column stacks from the bottom, in the same order every time', () => {
    const drop = loaderFills.find((v) => v.id === 'drop')!
    const ranks = drop.rank(5, 4)

    expect(drop.drop).toBe(true)
    expect(drop.rank(5, 4)).toEqual(ranks)
    for (let x = 0; x < 5; x++) {
      // a square lands on the one below it, so ranks fall towards the bottom of the column.
      const column = [0, 1, 2, 3].map((y) => ranks[y * 5 + x])
      expect(column).toEqual([...column].sort((a, b) => b - a))
    }
  })

  it('describes every variant in lowercase', () => {
    for (const { name, description } of loaderFills) {
      expect(name).toBe(name.toLowerCase())
      expect(description).toBe(description.toLowerCase())
    }
  })
})
