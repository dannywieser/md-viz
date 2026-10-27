import { noteId, noteTitle } from '../../../src/sources/file/note-id'

describe('noteId and noteTitle', () => {
  it('derives a stable 16-char slash-free id from the relative path', () => {
    expect(noteId('a/b.md')).toMatch(/^[0-9a-f]{16}$/)
    expect(noteId('a/b.md')).toBe(noteId('a/b.md'))
    expect(noteId('a/b.md')).not.toBe(noteId('b.md'))
  })

  it('strips the md extension from the file name only', () => {
    expect(noteTitle('sub/plan.md')).toBe('plan')
    expect(noteTitle('Plan.MD')).toBe('Plan')
    expect(noteTitle('a.md.md')).toBe('a.md')
  })
})
