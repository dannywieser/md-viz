import { COLUMN_GAP, COLUMN_WIDTH } from '../../../src/shared/window-size'
import {
  columnPitch,
  gridHeight,
  MIN_GAP,
  SMALL_GRID_HEIGHT,
  SMALL_GRID_NOTES,
} from '../../../src/renderer/src/lib/sync-layout'

describe('gridHeight', () => {
  it('keeps the small height for a few notes, even none', () => {
    expect(gridHeight(0)).toBe(SMALL_GRID_HEIGHT)
    expect(gridHeight(SMALL_GRID_NOTES)).toBe(SMALL_GRID_HEIGHT)
  })

  it('fills the height for more', () => {
    expect(gridHeight(SMALL_GRID_NOTES + 1)).toBeUndefined()
  })
})

describe('columnPitch', () => {
  const plain = COLUMN_WIDTH + COLUMN_GAP

  it('is the plain pitch until the dot spacing is known', () => {
    expect(columnPitch(undefined)).toBe(plain)
  })

  it('is the whole number of spacings that fits the plain pitch', () => {
    expect(columnPitch(16)).toBe(304)
    expect(columnPitch(30)).toBe(300)
  })

  it('is the plain pitch when the nearest whole spacings leave too small a gap', () => {
    // 9 spacings of 31 are 279px: a gap of 7px.
    expect(279 - COLUMN_WIDTH).toBeLessThan(MIN_GAP)
    expect(columnPitch(31)).toBe(plain)
  })
})
