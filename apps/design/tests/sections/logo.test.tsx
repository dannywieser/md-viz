import { render, screen } from '@testing-library/react'
import { expectLowercase } from '../lowercase'
import { LogoSection } from '../../src/sections/logo'

describe('LogoSection', () => {
  it('shows its section', () => {
    const { container } = render(<LogoSection />)

    expect(screen.getByRole('heading', { level: 2, name: 'logo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'glyphs' })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /^glyph / }).length).toBeGreaterThan(0)
    expectLowercase(container)
  })
})
