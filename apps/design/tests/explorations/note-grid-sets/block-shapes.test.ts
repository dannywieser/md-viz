import { blockShape, groupOutline } from '../../../src/explorations/note-grid-sets/block-shapes'

describe('blockShape', () => {
  it('rounds the side of the square', () => {
    expect(blockShape(50, 'round')).toEqual({ columns: 7, rows: 7 })
  })

  it('rounds the side of the square up', () => {
    expect(blockShape(50, 'ceil')).toEqual({ columns: 8, rows: 8 })
  })

  it('makes a near-square rectangle that holds every note', () => {
    expect(blockShape(50, 'rectangle')).toEqual({ columns: 8, rows: 7 })
    expect(blockShape(12, 'rectangle')).toEqual({ columns: 4, rows: 3 })
  })

  it('gives one note one cell with every rule', () => {
    for (const rule of ['round', 'ceil', 'rectangle'] as const) {
      expect(blockShape(1, rule)).toEqual({ columns: 1, rows: 1 })
    }
  })

  it('treats an empty set as one note', () => {
    expect(blockShape(0, 'round')).toEqual({ columns: 1, rows: 1 })
  })
})

describe('groupOutline', () => {
  it('is a rectangle when the last row is full', () => {
    expect(groupOutline(6, 3, 10)).toBe('M0,0H30V20H0Z')
  })

  it('steps in on a short last row', () => {
    expect(groupOutline(7, 3, 10)).toBe('M0,0H30V20H10V30H0Z')
  })

  it('is one row when there are fewer notes than columns', () => {
    expect(groupOutline(2, 5, 10)).toBe('M0,0H20V10H0Z')
  })
})
