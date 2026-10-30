import { toGridNote } from '../../src/lib/grid-note'

describe('toGridNote', () => {
  it('is the id and title of a note', () => {
    expect(toGridNote({ id: 'a', fields: { title: 'plan', tags: '["home"]' } })).toEqual({
      id: 'a',
      title: 'plan',
    })
  })

  it('titles a note without a title by its id', () => {
    expect(toGridNote({ id: 'untitled', fields: {} }).title).toBe('untitled')
  })
})
