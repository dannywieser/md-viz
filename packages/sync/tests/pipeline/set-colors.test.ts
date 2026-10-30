import { SET_COLOR_COUNT, assignColors, topLevelTag } from '../../src/pipeline/set-colors'

describe('assignColors', () => {
  it('has the 24 hue colours of the note palette', () => {
    expect(SET_COLOR_COUNT).toBe(24)
  })

  it('gives new tags the first colours, in alphabetical order', () => {
    expect(assignColors({}, ['work', 'home', 'ideas'])).toEqual({ home: 0, ideas: 1, work: 2 })
  })

  it('leaves a tag that has a colour alone', () => {
    expect(assignColors({ work: 5 }, ['work', 'home'])).toEqual({ home: 0 })
  })

  it('gives the same colours to the same tags however they are listed', () => {
    expect(assignColors({}, ['b', 'a', 'b'])).toEqual(assignColors({}, ['a', 'b']))
  })

  it('counts a tag once however many notes have it', () => {
    expect(assignColors({}, ['a', 'a', 'a'])).toEqual({ a: 0 })
  })

  it('takes the colours the fewest tags use, the lowest first', () => {
    // colour 0 is used twice, 1 once, the others not at all
    const existing = { a: 0, b: 0, c: 1 }

    expect(assignColors(existing, ['x', 'y'])).toEqual({ x: 2, y: 3 })
  })

  it('wraps around once every colour is used', () => {
    const tags = Array.from(
      { length: SET_COLOR_COUNT + 2 },
      (_, i) => `t${String(i).padStart(2, '0')}`,
    )

    const colors = assignColors({}, tags)

    expect(colors['t00']).toBe(0)
    expect(colors[`t${SET_COLOR_COUNT - 1}`]).toBe(SET_COLOR_COUNT - 1)
    expect(colors[`t${SET_COLOR_COUNT}`]).toBe(0)
    expect(colors[`t${SET_COLOR_COUNT + 1}`]).toBe(1)
  })

  it('treats a colour outside the palette as the one it wraps to', () => {
    expect(assignColors({ a: SET_COLOR_COUNT }, ['b'])).toEqual({ b: 1 })
  })

  it('handles tags named like object members', () => {
    const colors = assignColors({}, ['constructor', '__proto__', 'toString'])

    expect(Object.keys(colors).sort()).toEqual(['__proto__', 'constructor', 'toString'])
  })

  it('gives nothing when there are no tags', () => {
    expect(assignColors({ a: 1 }, [])).toEqual({})
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
