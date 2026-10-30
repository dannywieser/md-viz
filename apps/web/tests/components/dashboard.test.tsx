import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useGridLattice } from '@md-viz/ui'
import { TagGrid } from '../../src/components/tag-grid'
import { Dashboard } from '../../src/components/dashboard'
import { useDashboard } from '../../src/hooks/use-dashboard'

vi.mock('../../src/hooks/use-dashboard', () => ({ useDashboard: vi.fn() }))
vi.mock('../../src/components/tag-grid', () => ({
  TagGrid: vi.fn(() => <div data-testid="tag-grid" />),
}))
vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  useGridLattice: vi.fn(),
}))

const lattice = { ref: { current: null }, cell: null, onCellChange: vi.fn() }
const sets = [{ id: 'bear:daily', name: 'daily', color: 3, notes: [{ id: 'a', title: 'plan' }] }]

function dashboardIs(state: Partial<ReturnType<typeof useDashboard>>) {
  vi.mocked(useDashboard).mockReturnValue({
    status: 'ready',
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
    dashboardIs({ status: 'pending', sets: [] })
    render(<Dashboard />)

    expect(screen.getByRole('status', { name: 'loading notes' })).toBeInTheDocument()
    expect(screen.queryByTestId('tag-grid')).not.toBeInTheDocument()
  })

  it('says so when the cache cannot be read, and retries', async () => {
    const retry = vi.fn()
    dashboardIs({ status: 'error', sets: [], retry })
    render(<Dashboard />)

    expect(screen.getByRole('alert')).toHaveTextContent('could not load notes from the cache')
    await userEvent.click(screen.getByRole('button', { name: 'try again' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('shows one grid of the tag sets', () => {
    dashboardIs({})
    render(<Dashboard />)

    expect(screen.getByTestId('tag-grid')).toBeInTheDocument()
    expect(vi.mocked(TagGrid).mock.lastCall![0]).toMatchObject({ sets })
  })

  it('lines the page dots up with the tag grid, once there are notes', () => {
    dashboardIs({})
    render(<Dashboard />)

    expect(vi.mocked(TagGrid).mock.lastCall![0]).toMatchObject({
      gridRef: lattice.ref,
      onCellChange: lattice.onCellChange,
    })
    expect(useGridLattice).toHaveBeenLastCalledWith(true)
  })

  it('does not follow the grid while there are no notes', () => {
    dashboardIs({ sets: [] })
    render(<Dashboard />)

    expect(useGridLattice).toHaveBeenLastCalledWith(false)
  })
})
