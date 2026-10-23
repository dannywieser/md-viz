import { NOTE_COLORS } from '../../src/lib/note-colors'

describe('NOTE_COLORS', () => {
  it('is the number of colours in the note palette', () => {
    expect(NOTE_COLORS).toBe(10)
  })
})
