import { render, screen } from '@testing-library/react'
import { IterationSection } from '../../../src/explorations/note-grid-sets/iteration-section'

describe('IterationSection', () => {
  it('shows the number, title, date and content', () => {
    render(
      <IterationSection number={2} title="a title" date="2026.10.30">
        <p>content</p>
      </IterationSection>,
    )

    expect(screen.getByRole('heading', { name: 'iteration 2: a title' })).toBeInTheDocument()
    expect(screen.getByText('2026.10.30')).toBeInTheDocument()
    expect(screen.getByText('content')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'iteration 2' })).toBeInTheDocument()
  })
})
