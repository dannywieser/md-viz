import { render, screen } from '@testing-library/react'
import { ColorsPage } from '../../src/pages/colors-page'

describe('ColorsPage', () => {
  it('shows the palette and the themes', () => {
    render(<ColorsPage />)

    expect(screen.getByRole('heading', { level: 2, name: 'themes' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(1)
  })
})
