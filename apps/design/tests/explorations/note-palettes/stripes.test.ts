import { stripeHeights } from '../../../src/explorations/note-palettes/stripes'

describe('stripeHeights', () => {
  it('fills the cell with whole pixels', () => {
    expect(stripeHeights(12, 3)).toEqual([4, 4, 4])
    expect(stripeHeights(4, 1)).toEqual([4])
  })

  it('gives the leftover pixels to the first stripes', () => {
    expect(stripeHeights(4, 3)).toEqual([2, 1, 1])
    expect(stripeHeights(5, 2)).toEqual([3, 2])
  })
})
