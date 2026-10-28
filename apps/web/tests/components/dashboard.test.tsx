import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useGridLattice } from '@md-viz/ui'
import { AllNotesGrid } from '../../src/components/all-notes-grid'
import { Dashboard } from '../../src/components/dashboard'
import { SetGrid } from '../../src/components/set-grid'
import { useDashboard } from '../../src/hooks/use-dashboard'

vi.mock('../../src/hooks/use-dashboard', () => ({ useDashboard: vi.fn() }))
vi.mock('../../src/components/set-grid', () => ({
  SetGrid: vi.fn(({ label }: { label: string }) => <div data-testid="set-grid">{label}</div>),
}))
vi.mock('../../src/components/all-notes-grid', () => ({
  AllNotesGrid: vi.fn(() => <div data-testid="all-notes-grid" />),
}))
vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  useGridLattice: vi.fn(),
}))

const lattice = { ref: { current: null }, cell: null, onCellChange: vi.fn() }
const notes = [{ id: 'a', title: 'plan', color: 0 }]
const sets = [
  { id: 'bear:created-today', label: 'created today', count: 1 },
  { id: 'bear:modified-today', label: 'modified today', count: 1 },
]

function dashboardIs(state: Partial<ReturnType<typeof useDashboard>>) {
  vi.mocked(useDashboard).mockReturnValue({
    status: 'ready',
    notes,
    sets,
    retry: vi.fn(),
    ...state,
  })
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.mocked(useGridLattice).mockReturnValue(lattice)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows the loader while the cache loads', () => {
    dashboardIs({ status: 'pending', notes: [], sets: [] })
    render(<Dashboard />)

    expect(screen.getByRole('status', { name: 'loading notes' })).toBeInTheDocument()
    expect(screen.queryByTestId('all-notes-grid')).not.toBeInTheDocument()
  })

  it('says so when the cache cannot be read, and retries', async () => {
    const retry = vi.fn()
    dashboardIs({ status: 'error', notes: [], sets: [], retry })
    render(<Dashboard />)

    expect(screen.getByRole('alert')).toHaveTextContent('could not load notes from the cache')
    await userEvent.click(screen.getByRole('button', { name: 'try again' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('shows a grid for each set and one for all notes', () => {
    dashboardIs({})
    render(<Dashboard />)

    expect(screen.getAllByTestId('set-grid').map((el) => el.textContent)).toEqual([
      'created today',
      'modified today',
    ])
    expect(screen.getByTestId('all-notes-grid')).toBeInTheDocument()
    expect(vi.mocked(SetGrid).mock.calls[0][0]).toMatchObject({ id: 'bear:created-today', notes })
    expect(vi.mocked(AllNotesGrid).mock.lastCall![0]).toMatchObject({ notes })
  })

  it('shows only all notes when the cache holds no sets', () => {
    dashboardIs({ sets: [] })
    render(<Dashboard />)

    expect(screen.queryByTestId('set-grid')).not.toBeInTheDocument()
    expect(screen.getByTestId('all-notes-grid')).toBeInTheDocument()
  })

  it('lines the page dots up with the all-notes grid, once there are notes', () => {
    dashboardIs({})
    render(<Dashboard />)

    expect(vi.mocked(AllNotesGrid).mock.lastCall![0]).toMatchObject({
      gridRef: lattice.ref,
      onCellChange: lattice.onCellChange,
    })
    expect(useGridLattice).toHaveBeenLastCalledWith(true)
  })

  it('does not follow the grid while there are no notes', () => {
    dashboardIs({ notes: [], sets: [] })
    render(<Dashboard />)

    expect(useGridLattice).toHaveBeenLastCalledWith(false)
  })
})
