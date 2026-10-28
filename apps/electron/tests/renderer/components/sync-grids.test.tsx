import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { useGridLattice } from '@md-viz/ui'
import { StatusGrid } from '../../../src/renderer/src/components/status-grid'
import { SyncGrids } from '../../../src/renderer/src/components/sync-grids'
import { SMALL_GRID_HEIGHT } from '../../../src/renderer/src/lib/sync-layout'
import { COLUMN_WIDTH } from '../../../src/shared/window-size'

vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  useGridLattice: vi.fn(),
}))
vi.mock('../../../src/renderer/src/components/status-grid', () => ({
  StatusGrid: vi.fn(({ label }: { label: string }) => <section aria-label={label} />),
}))

const onCellChange = vi.fn()
const ref = { current: null }
const latticeCell = (cell: number | null) =>
  vi.mocked(useGridLattice).mockReturnValue({ ref, cell, onCellChange })

const note = (id: string) => ({ id, title: id, tags: [] })
const many = (count: number) => Array.from({ length: count }, (_, i) => note(`n${i}`))
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
        tagColors={{}}
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
        tagColors={{}}
        notes={{ updated: [note('a')], deleted: [], unchanged: [note('b'), note('c')] }}
      />,
    )

    expect(grids().unchanged.reference).toBe(true)
    expect(grids().updated.reference).toBe(false)
    expect(grids().deleted.reference).toBe(false)
  })

  it('only lines the page up while the reference grid has notes', () => {
    const { rerender } = render(
      <SyncGrids tagColors={{}} notes={{ updated: [note('a')], deleted: [], unchanged: [] }} />,
    )
    expect(useGridLattice).toHaveBeenLastCalledWith(true)

    rerender(<SyncGrids tagColors={{}} notes={{ updated: [], deleted: [], unchanged: [] }} />)
    expect(useGridLattice).toHaveBeenLastCalledWith(false)
  })

  it('keeps the small height for a few notes and fills the height for many', () => {
    render(
      <SyncGrids tagColors={{}} notes={{ updated: many(40), deleted: many(6), unchanged: [] }} />,
    )

    expect(grids().updated.height).toBeUndefined()
    expect(grids().deleted.height).toBe(SMALL_GRID_HEIGHT)
    expect(grids().unchanged.height).toBe(SMALL_GRID_HEIGHT)
  })

  it('pins the last block to the right of its column, the others to the left', () => {
    render(<SyncGrids tagColors={{}} notes={{ updated: [], deleted: [], unchanged: [] }} />)

    expect(grids().updated.align).toBe('start')
    expect(grids().deleted.align).toBe('start')
    expect(grids().unchanged.align).toBe('end')
  })

  it('gives the reference grid the lattice ref and cell callback', () => {
    render(
      <SyncGrids tagColors={{}} notes={{ updated: [note('a')], deleted: [], unchanged: [] }} />,
    )

    expect(grids().updated.gridRef).toBe(ref)
    expect(grids().updated.onCellChange).toBe(onCellChange)
  })

  it('has the plain gap and no cell step until the reference reports its cell', () => {
    const { container } = render(
      <SyncGrids tagColors={{}} notes={{ updated: [note('a')], deleted: [], unchanged: [] }} />,
    )

    expect(grids().deleted.cellStep).toBeUndefined()
    expect(container.firstElementChild).toHaveStyle({ columnGap: '32px' })
  })

  it('follows the reference cell: spacing for the other grids and a gap in whole spacings', () => {
    latticeCell(30)
    const { container } = render(
      <SyncGrids tagColors={{}} notes={{ updated: [note('a')], deleted: [], unchanged: [] }} />,
    )

    expect(grids().deleted.cellStep).toBe(30)
    // the column pitch is 10 spacings of 30 (300px), so the gap is 300 - 272.
    expect(container.firstElementChild).toHaveStyle({ columnGap: `${300 - COLUMN_WIDTH}px` })
  })

  it('gives every grid the tag colours', () => {
    render(
      <SyncGrids
        notes={{ updated: [note('a')], deleted: [], unchanged: [] }}
        tagColors={{ work: 3 }}
      />,
    )

    for (const props of Object.values(grids())) expect(props.tagColors).toEqual({ work: 3 })
  })
})
