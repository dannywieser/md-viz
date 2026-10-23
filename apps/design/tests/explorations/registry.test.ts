import { explorations, findExploration } from '../../src/explorations/registry'

describe('explorations', () => {
  it('has unique slugs', () => {
    const slugs = explorations.map((exploration) => exploration.slug)

    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('gives every exploration a lowercase title and description', () => {
    for (const { title, description } of explorations) {
      expect(title).toBe(title.toLowerCase())
      expect(description).toBe(description.toLowerCase())
    }
  })

  it('finds an exploration by slug', () => {
    expect(findExploration('background')?.title).toBe('background')
    expect(findExploration('nope')).toBeUndefined()
  })
})
