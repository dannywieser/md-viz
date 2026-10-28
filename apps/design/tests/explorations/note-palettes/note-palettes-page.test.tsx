import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotePalettes } from '../../../src/explorations/note-palettes/note-palettes-page'

describe('NotePalettes', () => {
  it('shows a panel for every theme', () => {
    render(<NotePalettes />)

    expect(screen.getByRole('heading', { name: 'note palettes' })).toBeInTheDocument()
    expect(screen.getAllByRole('region')).toHaveLength(8)
  })

  it('switches the mode of the panels', async () => {
    render(<NotePalettes />)
    expect(screen.getByRole('region', { name: 'nord' })).toHaveStyle({ '--background': '#2e3440' })

    await userEvent.click(screen.getByRole('button', { name: 'light' }))

    expect(screen.getByRole('region', { name: 'nord' })).toHaveStyle({ '--background': '#eceff4' })
  })
})
