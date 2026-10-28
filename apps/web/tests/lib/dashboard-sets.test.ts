import { pickSource, setsFor } from '../../src/lib/dashboard-sets'

const set = (id: string, count = 1) => ({ id, count })

describe('pickSource', () => {
  it('prefers bear', () => {
    expect(pickSource([set('file:modified-today'), set('bear:modified-today')])).toBe('bear')
  })

  it('falls back to file', () => {
    expect(pickSource([set('file:modified-today')])).toBe('file')
  })

  it('is null without a known source', () => {
    expect(pickSource([])).toBeNull()
    expect(pickSource([set('other:modified-today')])).toBeNull()
  })
})

describe('setsFor', () => {
  it('lists the four sets in display order with labels and counts', () => {
    const sets = [
      set('bear:modified-last-30-days', 4),
      set('bear:created-today', 1),
      set('bear:modified-today', 2),
      set('bear:created-last-30-days', 3),
      set('bear:other', 9),
      set('file:created-today', 7),
    ]

    expect(setsFor('bear', sets)).toEqual([
      { id: 'bear:created-today', label: 'created today', count: 1 },
      { id: 'bear:created-last-30-days', label: 'created last 30 days', count: 3 },
      { id: 'bear:modified-today', label: 'modified today', count: 2 },
      { id: 'bear:modified-last-30-days', label: 'modified last 30 days', count: 4 },
    ])
  })

  it('leaves out sets the cache does not hold, like the created sets of the file source', () => {
    const sets = [set('file:modified-today', 2), set('file:modified-last-30-days', 5)]

    expect(setsFor('file', sets).map((s) => s.id)).toEqual([
      'file:modified-today',
      'file:modified-last-30-days',
    ])
  })

  it('is empty without a source', () => {
    expect(setsFor(null, [set('bear:created-today')])).toEqual([])
  })
})
