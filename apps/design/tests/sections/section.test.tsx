import { render, screen } from '@testing-library/react'
import { Section } from '../../src/sections/section'

describe('Section', () => {
  it('shows the title, description and children', () => {
    render(
      <Section title="color" description="the palette">
        <p>swatches</p>
      </Section>,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'color' })).toBeInTheDocument()
    expect(screen.getByText('the palette')).toBeInTheDocument()
    expect(screen.getByText('swatches')).toBeInTheDocument()
  })

  it('leaves out the description when there is none', () => {
    const { container } = render(
      <Section title="color">
        <p>swatches</p>
      </Section>,
    )

    expect(container.querySelector('[data-slot="card-description"]')).toBeNull()
  })
})
