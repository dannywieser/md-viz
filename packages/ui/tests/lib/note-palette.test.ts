import { HUE_ORDER, NOTE_COLORS } from '../../src/lib/note-colors'
import { noteColors } from '../../src/lib/note-palette'
import { findTheme } from '../../src/lib/themes'

const solarized = findTheme('solarized')

describe('noteColors', () => {
  it('gives every note colour: the hues in three tiers and the neutral one', () => {
    const colors = noteColors(solarized)

    expect(colors).toHaveLength(NOTE_COLORS)
    expect(colors[NOTE_COLORS - 1]).toBe(solarized.ui.muted)
  })

  it('starts with the full hues in the spread order', () => {
    expect(noteColors(solarized).slice(0, 8)).toEqual(HUE_ORDER.map((name) => solarized.hues[name]))
  })

  it('mutes the second tier into the muted text and darkens the third', () => {
    const colors = noteColors(solarized)

    expect(colors[8]).toBe(
      `color-mix(in srgb, ${solarized.hues.violet} 55%, ${solarized.ui.muted})`,
    )
    expect(colors[16]).toBe(`color-mix(in srgb, ${solarized.hues.blue} 65%, black)`)
  })
})
