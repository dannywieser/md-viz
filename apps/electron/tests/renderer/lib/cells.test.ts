import { toCells } from '../../../src/renderer/src/lib/cells'

describe('toCells', () => {
  it('turns the notes of a sync into grid notes that list their tags', () => {
    const cells = toCells([{ id: 'a', title: 'plan', tags: ['home', 'work'] }])

    expect(cells).toEqual([{ id: 'a', title: 'plan', colors: [], tags: ['home', 'work'] }])
  })

  it('gives no notes no cells', () => {
    expect(toCells([])).toEqual([])
  })
})
