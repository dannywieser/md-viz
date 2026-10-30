import { buildGridModel, type GridSet } from '../../../src/lib/grid-layout/grid-model'

const set = (id: string, ...noteIds: string[]): GridSet => ({
  id,
  name: id,
  color: 0,
  notes: noteIds.map((noteId) => ({ id: noteId, title: noteId })),
})

describe('buildGridModel', () => {
  it('lists the notes sorted by id with the set of each', () => {
    const model = buildGridModel([set('a', 'n3', 'n1'), set('b', 'n2')])

    expect(model.notes.map((note) => note.id)).toEqual(['n1', 'n2', 'n3'])
    expect(model.order).toEqual([0, 1, 0])
    expect(model.counts).toEqual([2, 1])
  })

  it('drops the sets without notes', () => {
    const model = buildGridModel([set('empty'), set('b', 'n1')])

    expect(model.sets.map((s) => s.id)).toEqual(['b'])
    expect(model.order).toEqual([0])
  })

  it('keeps a note listed in several sets in the first one', () => {
    const model = buildGridModel([set('a', 'n1'), set('b', 'n1', 'n2')])

    expect(model.counts).toEqual([1, 1])
    expect(model.sets[1]?.notes.map((note) => note.id)).toEqual(['n2'])
  })

  it('has nothing for no sets', () => {
    expect(buildGridModel([])).toEqual({ sets: [], notes: [], order: [], counts: [] })
  })
})
