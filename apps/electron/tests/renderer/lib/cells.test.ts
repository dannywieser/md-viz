import { toCells } from '../../../src/renderer/src/lib/cells'

describe('toCells', () => {
  it('turns the notes of a sync into grid notes', () => {
    const cells = toCells([{ id: 'a', title: 'plan', tags: ['home', 'work'] }])

    expect(cells).toEqual([{ id: 'a', title: 'plan' }])
  })

  it('gives no notes no cells', () => {
    expect(toCells([])).toEqual([])
  })
})
