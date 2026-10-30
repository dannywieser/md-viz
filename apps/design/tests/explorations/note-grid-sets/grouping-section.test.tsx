import { render, screen } from '@testing-library/react'
import { GroupingSection } from '../../../src/explorations/note-grid-sets/grouping-section'

describe('GroupingSection', () => {
  it('shows the groups with and without an outline', () => {
    render(<GroupingSection />)

    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'colour only' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'with outline' })).toBeInTheDocument()
    expect(document.querySelectorAll('path')).toHaveLength(7)
  })
})
