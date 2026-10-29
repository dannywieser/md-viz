import { TAG_COLOR_COUNT, assignTagColors, topLevelTag } from '../../src/pipeline/tag-colors'

describe('assignTagColors', () => {
  it('has the 24 hue colours of the note palette', () => {
    expect(TAG_COLOR_COUNT).toBe(24)
  })

  it('gives new tags the first colours, in alphabetical order', () => {
    expect(assignTagColors({}, ['work', 'home', 'ideas'])).toEqual({ home: 0, ideas: 1, work: 2 })
  })

  it('leaves a tag that has a colour alone', () => {
    expect(assignTagColors({ work: 5 }, ['work', 'home'])).toEqual({ home: 0 })
  })

  it('gives the same colours to the same tags however they are listed', () => {
    expect(assignTagColors({}, ['b', 'a', 'b'])).toEqual(assignTagColors({}, ['a', 'b']))
  })

  it('counts a tag once however many notes have it', () => {
    expect(assignTagColors({}, ['a', 'a', 'a'])).toEqual({ a: 0 })
  })

  it('takes the colours the fewest tags use, the lowest first', () => {
    // colour 0 is used twice, 1 once, the others not at all
    const existing = { a: 0, b: 0, c: 1 }

    expect(assignTagColors(existing, ['x', 'y'])).toEqual({ x: 2, y: 3 })
  })

  it('wraps around once every colour is used', () => {
    const tags = Array.from(
      { length: TAG_COLOR_COUNT + 2 },
      (_, i) => `t${String(i).padStart(2, '0')}`,
    )

    const colors = assignTagColors({}, tags)

    expect(colors['t00']).toBe(0)
    expect(colors[`t${TAG_COLOR_COUNT - 1}`]).toBe(TAG_COLOR_COUNT - 1)
    expect(colors[`t${TAG_COLOR_COUNT}`]).toBe(0)
    expect(colors[`t${TAG_COLOR_COUNT + 1}`]).toBe(1)
  })

  it('treats a colour outside the palette as the one it wraps to', () => {
    expect(assignTagColors({ a: TAG_COLOR_COUNT }, ['b'])).toEqual({ b: 1 })
  })

  it('handles tags named like object members', () => {
    const colors = assignTagColors({}, ['constructor', '__proto__', 'toString'])

    expect(Object.keys(colors).sort()).toEqual(['__proto__', 'constructor', 'toString'])
  })

  it('gives nothing when there are no tags', () => {
    expect(assignTagColors({ a: 1 }, [])).toEqual({})
  })
})

describe('topLevelTag', () => {
  it('is the first part of a nested tag', () => {
    expect(topLevelTag('daily/10/28')).toBe('daily')
  })

  it('is a plain tag as it is', () => {
    expect(topLevelTag('ideas')).toBe('ideas')
  })

  it('keeps a tag that starts with a slash whole', () => {
    expect(topLevelTag('/odd')).toBe('/odd')
    expect(topLevelTag('/')).toBe('/')
  })
})
