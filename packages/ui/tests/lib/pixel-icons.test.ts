import { PIXEL_ICONS } from '../../src/lib/pixel-icons'

describe('PIXEL_ICONS', () => {
  it.each(Object.entries(PIXEL_ICONS))('%s is equal-width rows of # + .', (_name, { rows }) => {
    for (const row of rows) {
      expect(row).toHaveLength(rows[0].length)
      expect(row).toMatch(/^[#+.]+$/)
    }
  })

  it('colours the ghost body and the crack of the broken tile', () => {
    expect(PIXEL_ICONS.ghost.palette).toBe('fill')
    expect(PIXEL_ICONS['broken-tile'].palette).toBe('accent')
  })
})
