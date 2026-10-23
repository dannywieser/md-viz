import { modes, variants } from '../../src/routes/background-variants'

const input = { mode: 'light', cell: 6, strength: 1 } as const

describe('variants', () => {
  it('has unique ids', () => {
    const ids = variants.map((variant) => variant.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('styles every variant in both modes, except the flat baseline', () => {
    for (const variant of variants) {
      for (const mode of Object.keys(modes) as (keyof typeof modes)[]) {
        const style = variant.style({ ...input, mode })
        if (variant.id === 'flat') expect(style).toEqual({})
        else expect(style.backgroundImage).toBeTruthy()
      }
    }
  })

  it('draws the scaled dots at the lattice spacing, centred on the tile', () => {
    const scaled = variants.find((variant) => variant.id === 'dots-scaled')!

    const style = scaled.style(input)

    expect(style.backgroundSize).toBe('18px 18px')
    expect(style.backgroundPosition).toBe('9px 9px')
  })

  it('scales the dot strength, clamped to a valid percentage', () => {
    const dots = variants.find((variant) => variant.id === 'dots-16')!

    expect(dots.style({ ...input, strength: 2 }).backgroundImage).toContain('100%')
    expect(dots.style({ ...input, strength: 100 }).backgroundImage).toContain('100%')
    expect(dots.style({ ...input, strength: -1 }).backgroundImage).toContain(' 0%')
  })

  it('uses a darker line color for the current grid in dark mode', () => {
    const current = variants.find((variant) => variant.id === 'current')!

    expect(current.style({ ...input, mode: 'dark' }).backgroundImage).toContain('#073642')
  })
})
