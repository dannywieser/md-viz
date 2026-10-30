import { naturalOrder } from '../../../src/explorations/note-grid-sets/natural-order'

describe('naturalOrder', () => {
  it('has every set as often as it has notes', () => {
    const order = naturalOrder([5, 3, 1])

    expect(order).toHaveLength(9)
    expect(order.filter((s) => s === 0)).toHaveLength(5)
    expect(order.filter((s) => s === 1)).toHaveLength(3)
    expect(order.filter((s) => s === 2)).toHaveLength(1)
  })

  it('is the same every time for a seed and mixes the sets', () => {
    expect(naturalOrder([20, 20])).toEqual(naturalOrder([20, 20]))
    expect(naturalOrder([20, 20])).not.toEqual(naturalOrder([20, 20], 8))
    expect(naturalOrder([20, 20])).not.toEqual([
      ...Array.from({ length: 20 }, () => 0),
      ...Array.from({ length: 20 }, () => 1),
    ])
  })
})
