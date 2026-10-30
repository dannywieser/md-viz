import { labelFits, truncateLabel } from '../../../src/explorations/note-grid-sets/label-fit'

describe('labelFits', () => {
  it('fits a short label in a big block', () => {
    expect(labelFits('set a', 100, 60)).toBe(true)
  })

  it('does not fit when the block is too narrow', () => {
    expect(labelFits('a long set name', 60, 60)).toBe(false)
  })

  it('does not fit when the block is too short', () => {
    expect(labelFits('set a', 200, 20)).toBe(false)
  })
})

describe('truncateLabel', () => {
  it('keeps a label that fits', () => {
    expect(truncateLabel('set a', 100)).toBe('set a')
  })

  it('cuts a label with an ellipsis', () => {
    expect(truncateLabel('set alpha', 60)).toBe('set a…')
  })

  it('is empty when not even two characters fit', () => {
    expect(truncateLabel('set a', 20)).toBe('')
  })
})
