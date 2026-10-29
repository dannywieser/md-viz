import { toCells } from '../../../src/renderer/src/lib/cells'

describe('toCells', () => {
  it('colours a note by its tags, in order, and lists them', () => {
    const cells = toCells([{ id: 'a', title: 'plan', tags: ['home', 'work'] }], {
      work: 3,
      home: 7,
    })

    expect(cells).toEqual([{ id: 'a', title: 'plan', colors: [7, 3], tags: ['home', 'work'] }])
  })

  it('leaves out tags that have no colour but still lists them', () => {
    const cells = toCells([{ id: 'a', title: 'plan', tags: ['new', 'work'] }], { work: 3 })

    expect(cells[0]).toMatchObject({ colors: [3], tags: ['new', 'work'] })
  })

  it('has no colours for a note without tags', () => {
    expect(toCells([{ id: 'a', title: 'plan', tags: [] }], { work: 3 })[0]?.colors).toEqual([])
  })

  it('does not take a colour from the prototype of the colours', () => {
    const cells = toCells([{ id: 'a', title: 'plan', tags: ['constructor', 'toString'] }], {})

    expect(cells[0]?.colors).toEqual([])
  })

  it('colours a nested tag by its top level and counts a top level once', () => {
    const cells = toCells(
      [{ id: 'a', title: 'log', tags: ['daily/10/28', 'daily/10/29', 'work'] }],
      {
        daily: 2,
        work: 9,
      },
    )

    expect(cells[0]).toMatchObject({
      colors: [2, 9],
      tags: ['daily/10/28', 'daily/10/29', 'work'],
    })
  })
})
