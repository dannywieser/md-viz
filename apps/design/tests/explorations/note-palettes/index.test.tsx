import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { notePalettes } from '../../../src/explorations/note-palettes'

vi.mock('../../../src/explorations/note-palettes/note-palettes-page', () => ({
  NotePalettes: () => <p>the note palettes page</p>,
}))

describe('note palettes exploration', () => {
  it('is served at /explorations/note-palettes', () => {
    expect(notePalettes.slug).toBe('note-palettes')
  })

  it('loads the note palettes page', async () => {
    render(
      <Suspense fallback="loading">
        <notePalettes.Page />
      </Suspense>,
    )

    expect(await screen.findByText('the note palettes page')).toBeInTheDocument()
  })
})
