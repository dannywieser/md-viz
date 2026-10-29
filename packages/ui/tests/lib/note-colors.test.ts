import {
  ACCENT_COLORS,
  DEFAULT_NOTE_COLOR,
  HUE_COLORS,
  HUE_ORDER,
  NOTE_COLORS,
  TIERS,
} from '../../src/lib/note-colors'

describe('note colours', () => {
  it('has eight hues in three tiers and the neutral grey', () => {
    expect(ACCENT_COLORS).toBe(8)
    expect(TIERS).toBe(3)
    expect(HUE_COLORS).toBe(24)
    expect(NOTE_COLORS).toBe(25)
  })

  it('uses the neutral grey, the last colour, for notes without tags', () => {
    expect(DEFAULT_NOTE_COLOR).toBe(NOTE_COLORS - 1)
  })

  it('names every hue once', () => {
    expect(new Set(HUE_ORDER).size).toBe(ACCENT_COLORS)
  })
})
