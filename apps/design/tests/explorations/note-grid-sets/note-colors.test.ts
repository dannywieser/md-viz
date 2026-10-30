import { DEFAULT_NOTE_COLOR } from '@md-viz/ui'
import {
  colorVar,
  noteColorIndexes,
  stripeHeights,
} from '../../../src/explorations/note-grid-sets/note-colors'

const note = {
  id: 'n',
  title: 'n',
  sets: ['set-a', 'set-b'],
  tags: ['alpha', 'beta', 'gamma', 'delta'],
}

describe('noteColorIndexes', () => {
  it('uses the colours of the sets', () => {
    expect(noteColorIndexes(note, 'set')).toEqual([0, 1])
  })

  it('uses the colours of the first three tags', () => {
    expect(noteColorIndexes(note, 'tag')).toEqual([0, 1, 2])
  })

  it('is the neutral grey without tags', () => {
    expect(noteColorIndexes({ ...note, tags: [] }, 'tag')).toEqual([DEFAULT_NOTE_COLOR])
  })

  it('is the neutral grey without sets', () => {
    expect(noteColorIndexes({ ...note, sets: [] }, 'set')).toEqual([DEFAULT_NOTE_COLOR])
  })
})

describe('colorVar', () => {
  it('names the theme variable', () => {
    expect(colorVar(3)).toBe('var(--note-3)')
  })
})

describe('stripeHeights', () => {
  it('fills the square, the first stripes taking the leftover px', () => {
    expect(stripeHeights(10, 3)).toEqual([4, 3, 3])
    expect(stripeHeights(9, 3)).toEqual([3, 3, 3])
    expect(stripeHeights(7, 1)).toEqual([7])
  })
})
