import { render, screen } from '@testing-library/react'
import { NoteGridSets } from '../../../src/explorations/note-grid-sets/note-grid-sets-page'

vi.mock('../../../src/explorations/note-grid-sets/iterations', () => ({
  iterations: [
    { number: 2, title: 'second', date: '2026.10.30', Component: () => <p>second content</p> },
    { number: 1, title: 'first', date: '2026.10.29', Component: () => <p>first content</p> },
  ],
}))

describe('NoteGridSets', () => {
  it('shows the title', () => {
    render(<NoteGridSets />)

    expect(screen.getByRole('heading', { name: 'note grid sets', level: 1 })).toBeInTheDocument()
  })

  it('shows every iteration, the newest on top', () => {
    render(<NoteGridSets />)

    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(['iteration 2: second', 'iteration 1: first'])
    expect(screen.getByText('first content')).toBeInTheDocument()
  })
})
