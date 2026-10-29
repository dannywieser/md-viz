import { MAX_STRIPES, stripeColors, stripeHeights } from '../../src/lib/tag-stripes'

describe('stripeColors', () => {
  it('is the neutral grey for a note without tags', () => {
    expect(stripeColors([])).toEqual([24])
  })

  it('keeps the first three colours', () => {
    expect(MAX_STRIPES).toBe(3)
    expect(stripeColors([1, 2, 3, 4])).toEqual([1, 2, 3])
  })

  it('wraps colours onto the palette', () => {
    expect(stripeColors([25, -1])).toEqual([0, 24])
  })
})

describe('stripeHeights', () => {
  it('fills the size with whole pixels', () => {
    expect(stripeHeights(12, 3)).toEqual([4, 4, 4])
    expect(stripeHeights(4, 1)).toEqual([4])
  })

  it('gives the leftover pixels to the first stripes', () => {
    expect(stripeHeights(4, 3)).toEqual([2, 1, 1])
    expect(stripeHeights(5, 2)).toEqual([3, 2])
  })

  it('gives zero to the last stripes when there are fewer pixels than stripes', () => {
    expect(stripeHeights(2, 3)).toEqual([1, 1, 0])
  })
})
