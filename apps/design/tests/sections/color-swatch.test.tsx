import { render, screen } from '@testing-library/react'
import { ColorSwatch } from '../../src/sections/color-swatch'

describe('ColorSwatch', () => {
  it('shows the label, the css variable and a patch of its color', () => {
    const { container } = render(<ColorSwatch label="blue" cssVar="--sol-blue" />)

    expect(screen.getByText('blue')).toBeInTheDocument()
    expect(screen.getByText('--sol-blue')).toBeInTheDocument()
    expect(container.querySelector('[aria-hidden]')).toHaveStyle({
      backgroundColor: 'var(--sol-blue)',
    })
  })
})
