import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoteGrid } from '@md-viz/ui'
import { NoteGridPage } from '../../src/component-pages/note-grid-page'

vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  NoteGrid: vi.fn(() => <div data-testid="note-grid" />),
}))

const calls = () => vi.mocked(NoteGrid).mock.calls.map(([props]) => props)
const mainGrid = () =>
  calls()
    .filter((props) => props.label === 'notes')
    .at(-1)!
const total = (sets: { notes: unknown[] }[]) => sets.reduce((sum, set) => sum + set.notes.length, 0)

describe('NoteGridPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows the main grid with 50 notes in 3 sets and the four states', () => {
    render(<NoteGridPage />)

    expect(total(mainGrid().sets)).toBe(50)
    expect(mainGrid().sets).toHaveLength(3)
    const states: Record<string, [number, number]> = {}
    for (const props of calls().filter((candidate) => candidate.label !== 'notes')) {
      states[props.label!] = [total(props.sets), props.sets.length]
    }
    expect(states).toEqual({ one: [1, 1], 'a few': [5, 2], many: [500, 4], empty: [0, 0] })
  })

  it('splits the notes with the first set the biggest and no set empty', () => {
    render(<NoteGridPage />)
    const sizes = mainGrid().sets.map((set) => set.notes.length)

    expect(sizes[0]).toBeGreaterThan(sizes[1])
    expect(sizes.every((size) => size > 0)).toBe(true)
  })

  it('always looks the same', () => {
    render(<NoteGridPage />)
    const first = mainGrid().sets
    vi.clearAllMocks()
    render(<NoteGridPage />)

    expect(mainGrid().sets).toEqual(first)
  })

  it('switches the main grid to a preset', async () => {
    render(<NoteGridPage />)

    await userEvent.click(screen.getByRole('button', { name: '500' }))

    expect(total(mainGrid().sets)).toBe(500)
  })

  it('sets the count from the slider', () => {
    render(<NoteGridPage />)

    fireEvent.change(screen.getByRole('slider'), { target: { value: '1200' } })

    expect(total(mainGrid().sets)).toBe(1200)
  })

  it('switches the number of sets', async () => {
    render(<NoteGridPage />)

    await userEvent.click(screen.getByRole('button', { name: '12 sets' }))

    expect(mainGrid().sets).toHaveLength(12)
    expect(total(mainGrid().sets)).toBe(50)

    await userEvent.click(screen.getByRole('button', { name: '1 set' }))

    expect(mainGrid().sets).toHaveLength(1)
  })

  it('has no more sets than notes', async () => {
    render(<NoteGridPage />)
    await userEvent.click(screen.getByRole('button', { name: '12 sets' }))

    await userEvent.click(screen.getByRole('button', { name: '5' }))

    expect(mainGrid().sets).toHaveLength(5)
  })
})
