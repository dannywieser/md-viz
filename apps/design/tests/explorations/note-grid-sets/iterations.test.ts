import { iterations } from '../../../src/explorations/note-grid-sets/iterations'

describe('iterations', () => {
  it('lists the newest iteration first and never repeats a number', () => {
    const numbers = iterations.map((iteration) => iteration.number)

    expect(numbers).toEqual([...numbers].sort((a, b) => b - a))
    expect(new Set(numbers).size).toBe(numbers.length)
  })

  it('dates every iteration YYYY.MM.DD and names it in lowercase', () => {
    for (const { date, title } of iterations) {
      expect(date).toMatch(/^\d{4}\.\d{2}\.\d{2}$/)
      expect(title).toBe(title.toLowerCase())
    }
  })

  it('keeps iteration 1', () => {
    expect(iterations.some((iteration) => iteration.number === 1)).toBe(true)
  })
})
