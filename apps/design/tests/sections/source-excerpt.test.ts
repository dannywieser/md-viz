import { originCode, spacingCode } from '../../src/sections/source-excerpt'

describe('source excerpts', () => {
  it('has the real latticeSpacing, with its comment', () => {
    expect(spacingCode).toMatch(/^\/\*\*/)
    expect(spacingCode).toContain('export function latticeSpacing')
    expect(spacingCode).toMatch(/\}$/)
  })

  it('has the part of useDotLattice that sets the origin, without its indent', () => {
    expect(originCode).toMatch(/^const apply = \(\) => \{/)
    expect(originCode).toContain('--grid-origin-x')
    expect(originCode).toMatch(/^\}$/m)
  })
})
