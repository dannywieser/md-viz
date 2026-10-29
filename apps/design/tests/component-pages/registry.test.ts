import { components, findComponent } from '../../src/component-pages/registry'

describe('components registry', () => {
  it('has a unique slug per component, kebab-case', () => {
    const slugs = components.map(({ slug }) => slug)

    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(slug).toMatch(/^[a-z]+(-[a-z]+)*$/)
  })

  it('starts with the theme select', () => {
    expect(components[0].slug).toBe('theme-select')
  })

  it('finds a component by slug', () => {
    expect(findComponent('button')?.title).toBe('button')
    expect(findComponent('nope')).toBeUndefined()
  })
})
