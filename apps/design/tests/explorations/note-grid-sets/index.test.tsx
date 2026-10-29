import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { noteGridSets } from '../../../src/explorations/note-grid-sets'
import { findExploration } from '../../../src/explorations/registry'

vi.mock('../../../src/explorations/note-grid-sets/note-grid-sets-page', () => ({
  NoteGridSets: () => <p>the note grid sets page</p>,
}))

describe('note grid sets exploration', () => {
  it('is served at /explorations/note-grid-sets', () => {
    expect(noteGridSets.slug).toBe('note-grid-sets')
    expect(findExploration('note-grid-sets')).toBe(noteGridSets)
  })

  it('loads the note grid sets page', async () => {
    render(
      <Suspense fallback="loading">
        <noteGridSets.Page />
      </Suspense>,
    )

    expect(await screen.findByText('the note grid sets page')).toBeInTheDocument()
  })
})
