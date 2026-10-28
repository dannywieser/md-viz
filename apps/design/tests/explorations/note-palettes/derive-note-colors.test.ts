import { candidateThemes, variantFor } from '../../../src/explorations/note-palettes/candidate-themes'
import {
  HUE_COLORS,
  HUE_NAMES,
  HUE_ORDER,
  NEUTRAL_INDEX,
  noteColors,
} from '../../../src/explorations/note-palettes/derive-note-colors'

const solarized = variantFor(candidateThemes[0], 'light')

describe('noteColors', () => {
  it('gives 24 hue colours and the neutral one', () => {
    const colors = noteColors(solarized)

    expect(colors).toHaveLength(NEUTRAL_INDEX + 1)
    expect(HUE_COLORS).toBe(24)
    expect(colors[NEUTRAL_INDEX]).toBe(solarized.ui.muted)
  })

  it('starts with the full hues in the spread order', () => {
    const colors = noteColors(solarized)

    expect(colors.slice(0, HUE_ORDER.length)).toEqual(HUE_ORDER.map((name) => solarized.hues[name]))
  })

  it('mutes the second tier into the muted text and darkens the third', () => {
    const colors = noteColors(solarized)

    expect(colors[8]).toBe(`color-mix(in srgb, ${solarized.hues.green} 55%, ${solarized.ui.muted})`)
    expect(colors[16]).toBe(`color-mix(in srgb, ${solarized.hues.blue} 65%, black)`)
  })

  it('uses every hue once per tier', () => {
    expect([...HUE_ORDER].sort()).toEqual([...HUE_NAMES].sort())
    const colors = noteColors(solarized)
    const tierTwo = colors.slice(8, 16)

    expect(new Set(tierTwo).size).toBe(8)
  })
})
