import { render, screen } from '@testing-library/react'
import { HoverBar } from '../../../src/explorations/note-grid-sets/hover-bar'

describe('HoverBar', () => {
  it('shows the idle text when nothing is hovered', () => {
    render(<HoverBar width={100} idle="3 sets, 9 notes" hovered={null} />)

    expect(screen.getByText('3 sets, 9 notes')).toBeInTheDocument()
  })

  it('shows the hovered set and note', () => {
    render(<HoverBar width={100} idle="idle" hovered={{ name: 'set a', color: 0, note: 4 }} />)

    expect(screen.getByText('set a')).toBeInTheDocument()
    expect(screen.getByText('note 5')).toBeInTheDocument()
    expect(screen.queryByText('idle')).toBeNull()
  })
})
