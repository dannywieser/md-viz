import { latticeSpacing } from '../../src/lib/note-grid-layout'

describe('latticeSpacing', () => {
  it('divides large cells evenly so the dots stay close together', () => {
    expect(latticeSpacing(32)).toBe(32)
    expect(latticeSpacing(64)).toBe(32)
    expect(latticeSpacing(167)).toBeCloseTo(167 / 6)
    expect(latticeSpacing(167)).toBeLessThanOrEqual(32)
  })

  it('is the cell itself from the base up and a whole multiple below it', () => {
    expect(latticeSpacing(16)).toBe(16)
    expect(latticeSpacing(24)).toBe(24)
    expect(latticeSpacing(6)).toBe(18)
    expect(latticeSpacing(1)).toBe(16)
  })
})
