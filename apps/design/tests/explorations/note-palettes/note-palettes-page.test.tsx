import { render, screen } from '@testing-library/react'
import { candidateThemes } from '../../../src/explorations/note-palettes/candidate-themes'
import { NotePalettes } from '../../../src/explorations/note-palettes/note-palettes-page'

describe('NotePalettes', () => {
  it('shows a panel for every theme', () => {
    render(<NotePalettes />)

    expect(screen.getByRole('heading', { name: 'note palettes' })).toBeInTheDocument()
    expect(screen.getAllByRole('region')).toHaveLength(candidateThemes.length)
  })

  it('has no light or dark switch', () => {
    render(<NotePalettes />)

    // a text query: role queries are slow on a page this size
    expect(screen.queryByText(/^(light|dark)$/)).not.toBeInTheDocument()
  })
})
