import {
  CONTAINER_SIZES,
  CONTAINERS,
} from '../../../src/explorations/note-grid-sets/container-sizes'

describe('containers', () => {
  it('has a size for every container shape', () => {
    for (const { value } of CONTAINERS) {
      expect(CONTAINER_SIZES[value].width).toBeGreaterThan(0)
      expect(CONTAINER_SIZES[value].height).toBeGreaterThan(0)
    }
  })

  it('is wide, square and tall', () => {
    const { wide, square, tall } = CONTAINER_SIZES
    expect(wide.width).toBeGreaterThan(wide.height)
    expect(square.width).toBe(square.height)
    expect(tall.height).toBeGreaterThan(tall.width)
  })
})
