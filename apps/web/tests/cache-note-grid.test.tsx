import { render, screen } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { listNotesOptions } from '@md-viz/api-client/cache/react-query'
import { NoteGrid, useGridLattice } from '@md-viz/ui'
import { CacheNoteGrid } from '../src/cache-note-grid'

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }))
vi.mock('@md-viz/api-client/cache/react-query', () => ({
  listNotesOptions: vi.fn((options: unknown) => options),
}))
vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  NoteGrid: vi.fn(() => <div data-testid="note-grid" />),
  useGridLattice: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(useGridLattice).mockReturnValue(lattice)
})

function queryReturns(result: Partial<UseQueryResult>) {
  vi.mocked(useQuery).mockReturnValue(result as UseQueryResult)
}

const lattice = { ref: { current: null }, cell: null, onCellChange: vi.fn() }
const gridProps = () => vi.mocked(NoteGrid).mock.lastCall![0]

describe('CacheNoteGrid', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('asks the cache for the note titles', () => {
    queryReturns({ isPending: true })
    render(<CacheNoteGrid />)

    expect(listNotesOptions).toHaveBeenCalledWith({ query: { fields: 'title' } })
  })

  it('shows a loading message while the notes load', () => {
    queryReturns({ isPending: true })
    render(<CacheNoteGrid />)

    expect(screen.getByText('loading notes')).toBeInTheDocument()
    expect(NoteGrid).not.toHaveBeenCalled()
  })

  it('says so when the cache cannot be read', () => {
    queryReturns({ isPending: false, error: new Error('boom') })
    render(<CacheNoteGrid />)

    expect(screen.getByText('could not load notes from the cache')).toBeInTheDocument()
    expect(NoteGrid).not.toHaveBeenCalled()
  })

  it('passes one note per cached note, titled by its title or else its id', () => {
    queryReturns({
      isPending: false,
      data: [
        { id: 'a', fields: { title: 'plan' } },
        { id: 'untitled', fields: {} },
      ],
    })
    render(<CacheNoteGrid />)

    expect(screen.getByTestId('note-grid')).toBeInTheDocument()
    expect(gridProps().notes).toEqual([
      { id: 'a', title: 'plan', color: 0 },
      { id: 'untitled', title: 'untitled', color: 0 },
    ])
  })

  it('passes an empty grid when the cache has no notes', () => {
    queryReturns({ isPending: false, data: [] })
    render(<CacheNoteGrid />)

    expect(gridProps().notes).toEqual([])
  })

  it('gives the grid the lattice ref and cell callback, to line the page dots up with it', () => {
    queryReturns({ isPending: false, data: [] })
    render(<CacheNoteGrid />)

    expect(gridProps().ref).toBe(lattice.ref)
    expect(gridProps().onCellChange).toBe(lattice.onCellChange)
  })
})
