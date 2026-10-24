import { tooltipShift } from '../../src/lib/tooltip-shift'

describe('tooltipShift', () => {
  it('leaves a tooltip that fits where it is', () => {
    expect(tooltipShift(100, 80, 400, 8)).toBe(0)
  })

  it('moves a tooltip past the left edge right, to the margin', () => {
    expect(tooltipShift(-20, 80, 400, 8)).toBe(28)
  })

  it('moves a tooltip past the right edge left, to the margin', () => {
    expect(tooltipShift(340, 80, 400, 8)).toBe(-28)
  })

  it('moves a tooltip inside the margin out to the margin', () => {
    expect(tooltipShift(3, 80, 400, 8)).toBe(5)
  })

  it('aligns a tooltip wider than the viewport to the left margin', () => {
    expect(tooltipShift(-50, 500, 400, 8)).toBe(58)
  })
})
