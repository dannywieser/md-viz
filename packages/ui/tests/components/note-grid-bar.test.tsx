import { render, screen } from '@testing-library/react'
import { BAR_PX, NoteGridBar } from '../../src/components/note-grid-bar'

describe('NoteGridBar', () => {
  it('shows the idle text, is as wide as its block and has a fixed height', () => {
    const { container } = render(<NoteGridBar idle="12 notes in 3 sets" hovered={null} />)
    const bar = container.querySelector('[data-slot="note-grid-bar"]') as HTMLElement

    expect(screen.getByText('12 notes in 3 sets')).toBeInTheDocument()
    expect(bar).toHaveClass('w-full')
    expect(bar.style.height).toBe(`${BAR_PX}px`)
  })

  it('shows the hovered note with its set and the set colour instead of the idle text', () => {
    const { container } = render(
      <NoteGridBar idle="idle" hovered={{ title: 'garden plan', setName: 'home', color: 4 }} />,
    )

    expect(screen.queryByText('idle')).not.toBeInTheDocument()
    expect(screen.getByText('home')).toBeInTheDocument()
    expect(screen.getByText('garden plan')).toBeInTheDocument()
    expect((container.querySelector('[aria-hidden]') as HTMLElement).style.background).toBe(
      'var(--note-4)',
    )
  })

  it('shows its action at the right end', () => {
    render(<NoteGridBar idle="idle" hovered={null} action={<button>act</button>} />)

    expect(screen.getByRole('button', { name: 'act' })).toBeInTheDocument()
  })
})
