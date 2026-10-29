import { NOTE_COLORS, makeFakeNotes } from '../../src'

describe('makeFakeNotes', () => {
  it('makes the requested number of notes with unique ids', () => {
    const notes = makeFakeNotes(300)

    expect(notes).toHaveLength(300)
    expect(new Set(notes.map((note) => note.id)).size).toBe(300)
  })

  it('gives every note a lowercase title and a palette colour', () => {
    for (const note of makeFakeNotes(200)) {
      expect(note.title).toMatch(/^[a-z]+ [a-z]+$/)
      expect(note.colors).toHaveLength(1)
      expect(Number.isInteger(note.colors[0])).toBe(true)
      expect(note.colors[0]).toBeGreaterThanOrEqual(0)
      expect(note.colors[0]).toBeLessThan(NOTE_COLORS)
    }
  })

  it('returns nothing for a count of zero', () => {
    expect(makeFakeNotes(0)).toEqual([])
  })
})
