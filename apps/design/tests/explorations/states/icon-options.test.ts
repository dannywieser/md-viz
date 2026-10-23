import { icons, withCrack } from '../../../src/explorations/states/icon-options'

describe('icons', () => {
  it('has unique ids and lowercase names', () => {
    const ids = icons.map((icon) => icon.id)

    expect(new Set(ids).size).toBe(ids.length)
    for (const { name } of icons) expect(name).toBe(name.toLowerCase())
  })

  it('offers empty and error icons', () => {
    expect(icons.filter((icon) => icon.kind === 'empty').length).toBeGreaterThan(1)
    expect(icons.filter((icon) => icon.kind === 'error').length).toBeGreaterThan(1)
  })

  it('draws every icon as equal-width rows of # + .', () => {
    for (const { rows } of icons) {
      for (const row of rows) {
        expect(row).toHaveLength(rows[0].length)
        expect(row).toMatch(/^[#+.]+$/)
      }
    }
  })
})

describe('note palette icons', () => {
  it('fills the ghost and colours the crack of the broken tile', () => {
    expect(icons.find((icon) => icon.id === 'ghost')?.notePalette).toBe('fill')
    expect(icons.find((icon) => icon.id === 'broken-tile')?.notePalette).toBe('accent')
  })
})

describe('withCrack', () => {
  it('replaces one cell per row and leaves rows past the columns alone', () => {
    expect(withCrack(['###', '###', '###'], [0, 2], '.')).toEqual(['.##', '##.', '###'])
  })
})
