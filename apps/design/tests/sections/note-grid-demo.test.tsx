import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoteGrid } from '@md-viz/ui'
import { NoteGridDemo } from '../../src/sections/note-grid-demo'

vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  NoteGrid: vi.fn(() => <div data-testid="note-grid" />),
}))

const calls = () => vi.mocked(NoteGrid).mock.calls.map(([props]) => props)
const mainGrid = () =>
  calls()
    .filter((props) => props.label === 'notes')
    .at(-1)!

describe('NoteGridDemo', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows the main grid with 50 notes and the four states', () => {
    render(<NoteGridDemo />)

    expect(mainGrid().notes).toHaveLength(50)
    const states: Record<string, number> = {}
    for (const props of calls().filter((candidate) => candidate.label !== 'notes')) {
      states[props.label!] = props.notes.length
    }
    expect(states).toEqual({ one: 1, 'a few': 5, many: 500, empty: 0 })
  })

  it('gives the notes deterministic colors', () => {
    render(<NoteGridDemo />)
    const first = mainGrid().notes
    vi.clearAllMocks()
    render(<NoteGridDemo />)

    expect(mainGrid().notes).toEqual(first)
  })

  it('switches the main grid to a preset', async () => {
    render(<NoteGridDemo />)

    await userEvent.click(screen.getByRole('button', { name: '500' }))

    expect(mainGrid().notes).toHaveLength(500)
  })

  it('sets the count from the slider', () => {
    render(<NoteGridDemo />)

    fireEvent.change(screen.getByRole('slider'), { target: { value: '1200' } })

    expect(mainGrid().notes).toHaveLength(1200)
  })
})
