import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { getSetOptions } from '@md-viz/api-client/cache/react-query'
import { NoteGrid } from '@md-viz/ui'
import { SetGrid } from '../../src/components/set-grid'

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }))
vi.mock('@md-viz/api-client/cache/react-query', () => ({
  getSetOptions: vi.fn((options: unknown) => options),
}))
vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  NoteGrid: vi.fn(() => <div data-testid="note-grid" />),
}))

function queryReturns(result: Partial<UseQueryResult>) {
  vi.mocked(useQuery).mockReturnValue(result as UseQueryResult)
}

const notes = [
  { id: 'a', title: 'plan', color: 0 },
  { id: 'b', title: 'ideas', color: 0 },
]
const gridProps = () => vi.mocked(NoteGrid).mock.lastCall![0]

describe('SetGrid', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('asks the cache for the set', () => {
    queryReturns({ isPending: true })
    render(<SetGrid id="bear:created-today" label="created today" notes={notes} />)

    expect(getSetOptions).toHaveBeenCalledWith({ path: { id: 'bear:created-today' } })
  })

  it('shows the loader while the set loads', () => {
    queryReturns({ isPending: true })
    render(<SetGrid id="bear:created-today" label="created today" notes={notes} />)

    expect(screen.getByRole('status', { name: 'loading created today' })).toBeInTheDocument()
    expect(NoteGrid).not.toHaveBeenCalled()
  })

  it('says so when the set cannot be read, and tries again', async () => {
    const refetch = vi.fn()
    queryReturns({ isPending: false, error: new Error('boom'), refetch })
    render(<SetGrid id="bear:created-today" label="created today" notes={notes} />)

    expect(screen.getByRole('alert')).toHaveTextContent('could not load created today')
    await userEvent.click(screen.getByRole('button', { name: 'try again' }))
    expect(refetch).toHaveBeenCalledOnce()
    expect(NoteGrid).not.toHaveBeenCalled()
  })

  it('shows the members of the set under its label, skipping ids that are not cached notes', () => {
    queryReturns({
      isPending: false,
      data: { id: 'bear:created-today', updated: '', noteIds: ['b', 'gone', 'a'] },
    })
    render(<SetGrid id="bear:created-today" label="created today" notes={notes} />)

    expect(screen.getByTestId('note-grid')).toBeInTheDocument()
    expect(gridProps()).toMatchObject({
      label: 'created today',
      notes: [notes[1], notes[0]],
    })
  })

  it('shows an empty grid for a set without members', () => {
    queryReturns({
      isPending: false,
      data: { id: 'bear:created-today', updated: '', noteIds: [] },
    })
    render(<SetGrid id="bear:created-today" label="created today" notes={notes} />)

    expect(gridProps().notes).toEqual([])
  })
})
