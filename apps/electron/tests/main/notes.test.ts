// @vitest-environment node
import { noteToFields, type Note } from '../../src/main/notes'

const note: Note = {
  id: 'abc',
  source: 'bear',
  title: 'plan',
  body: '# plan\n#garden',
  tags: ['garden', 'garden/beds'],
  created: '2026-10-01T10:00:00.000Z',
  modified: '2026-10-02T11:30:00.000Z',
}

describe('noteToFields', () => {
  it('turns a note into the cache fields', () => {
    expect(noteToFields(note)).toEqual({
      title: 'plan',
      body: '# plan\n#garden',
      tags: '["garden","garden/beds"]',
      created: '2026-10-01T10:00:00.000Z',
      modified: '2026-10-02T11:30:00.000Z',
      source: 'bear',
    })
  })

  it('keeps an unknown creation date and no tags as empty values', () => {
    const fields = noteToFields({ ...note, source: 'file', tags: [], created: '' })

    expect(fields['tags']).toBe('[]')
    expect(fields['created']).toBe('')
    expect(fields['source']).toBe('file')
  })

  it('leaves the id out: the cache keys fields by id', () => {
    expect(noteToFields(note)).not.toHaveProperty('id')
  })
})
