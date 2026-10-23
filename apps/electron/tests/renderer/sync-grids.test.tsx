import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { useGridLattice } from '@md-viz/ui'
import { StatusGrid } from '../../src/renderer/src/status-grid'
import { SyncGrids } from '../../src/renderer/src/sync-grids'
import { COLUMN_WIDTH, MIN_GAP } from '../../src/renderer/src/sync-layout'

vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  useGridLattice: vi.fn(),
}))
vi.mock('../../src/renderer/src/status-grid', () => ({
  StatusGrid: vi.fn(({ label }: { label: string }) => <section aria-label={label} />),
}))

const onCellChange = vi.fn()
const ref = { current: null }
const latticeCell = (cell: number | null) =>
  vi.mocked(useGridLattice).mockReturnValue({ ref, cell, onCellChange })

const note = (id: string) => ({ id, title: id })
const grids = () =>
  Object.fromEntries(
    vi
      .mocked(StatusGrid)
      .mock.calls.slice(-3)
      .map(([props]) => [props.label, props]),
  ) as Record<string, ComponentProps<typeof StatusGrid>>

describe('SyncGrids', () => {
  beforeEach(() => {
    latticeCell(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows the updated, deleted and unchanged grids with their notes', () => {
    render(
      <SyncGrids
        notes={{ updated: [note('a')], deleted: [], unchanged: [note('b'), note('c')] }}
      />,
    )

    expect(
      screen.getAllByRole('region').map((region) => region.getAttribute('aria-label')),
    ).toEqual(['updated', 'deleted', 'unchanged'])
    expect(grids().unchanged.notes).toHaveLength(2)
  })

  it('uses the grid with the most notes as the reference', () => {
    render(
      <SyncGrids
        notes={{ updated: [note('a')], deleted: [], unchanged: [note('b'), note('c')] }}
      />,
    )

    expect(grids().unchanged.reference).toBe(true)
    expect(grids().updated.reference).toBe(false)
    expect(grids().deleted.reference).toBe(false)
  })

  it('only lines the page up while the reference grid has notes', () => {
    const { rerender } = render(
      <SyncGrids notes={{ updated: [note('a')], deleted: [], unchanged: [] }} />,
    )
    expect(useGridLattice).toHaveBeenLastCalledWith(true)

    rerender(<SyncGrids notes={{ updated: [], deleted: [], unchanged: [] }} />)
    expect(useGridLattice).toHaveBeenLastCalledWith(false)
  })

  it('gives the reference grid the lattice ref and cell callback', () => {
    render(<SyncGrids notes={{ updated: [note('a')], deleted: [], unchanged: [] }} />)

    expect(grids().updated.gridRef).toBe(ref)
    expect(grids().updated.onCellChange).toBe(onCellChange)
  })

  it('has the minimum gap and no cell step until the reference reports its cell', () => {
    const { container } = render(
      <SyncGrids notes={{ updated: [note('a')], deleted: [], unchanged: [] }} />,
    )

    expect(grids().deleted.cellStep).toBeUndefined()
    expect(container.firstElementChild).toHaveStyle({ columnGap: `${MIN_GAP}px` })
  })

  it('follows the reference cell: spacing for the other grids and a gap in whole spacings', () => {
    latticeCell(20)
    const { container } = render(
      <SyncGrids notes={{ updated: [note('a')], deleted: [], unchanged: [] }} />,
    )

    expect(grids().deleted.cellStep).toBe(20)
    // the column pitch (272 + 32 = 304) rounds up to 15 spacings of 20, so the gap is 300 - 272.
    const pitch = Math.ceil((COLUMN_WIDTH + MIN_GAP) / 20) * 20
    expect(container.firstElementChild).toHaveStyle({ columnGap: `${pitch - COLUMN_WIDTH}px` })
  })
})
