import {
  HUE_COLORS,
  NEUTRAL_INDEX,
} from '../../../src/explorations/note-palettes/derive-note-colors'
import { sampleNotes } from '../../../src/explorations/note-palettes/sample-notes'

describe('sampleNotes', () => {
  const notes = sampleNotes(56)

  it('makes one list per note', () => {
    expect(notes).toHaveLength(56)
  })

  it('leaves every seventh note untagged, with the neutral colour', () => {
    expect(notes[6]).toEqual([NEUTRAL_INDEX])
    expect(notes[13]).toEqual([NEUTRAL_INDEX])
  })

  it('gives tagged notes one to three hue colours', () => {
    const tagged = notes.filter((_, i) => i % 7 !== 6)

    for (const colors of tagged) {
      expect(colors.length).toBeGreaterThanOrEqual(1)
      expect(colors.length).toBeLessThanOrEqual(3)
      for (const color of colors) expect(color).toBeLessThan(HUE_COLORS)
    }
    expect(new Set(tagged.map((colors) => colors.length))).toEqual(new Set([1, 2, 3]))
  })
})
