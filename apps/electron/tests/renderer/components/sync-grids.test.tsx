import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { useGridLattice } from '@md-viz/ui'
import { StatusGrid } from '../../../src/renderer/src/components/status-grid'
import { SyncGrids } from '../../../src/renderer/src/components/sync-grids'
import { COLUMN_WIDTH, MIN_GAP } from '../../../src/renderer/src/lib/sync-layout'

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

  it('has empty grids copy the block size of the reference grid', () => {
    const many = Array.from({ length: 18 }, (_, i) => note(`n${i}`))
    render(<SyncGrids notes={{ updated: [], deleted: [], unchanged: many }} />)

    expect(grids().updated.emptySize).toEqual({ width: 267, height: 135 })
    expect(grids().deleted.emptySize).toEqual({ width: 267, height: 135 })
  })

  it('has no size to copy when every grid is empty', () => {
    render(<SyncGrids notes={{ updated: [], deleted: [], unchanged: [] }} />)

    expect(grids().updated.emptySize).toBeUndefined()
  })

  it('shows its children above the grids, as wide as the row ends at the last block', () => {
    const many = Array.from({ length: 18 }, (_, i) => note(`n${i}`))
    const { container } = render(
      <SyncGrids notes={{ updated: [], deleted: [], unchanged: many }}>
        <p>card</p>
      </SyncGrids>,
    )

    // two column pitches (272 + 32) and the 267px block of the 18 notes in the last column.
    expect(container.firstElementChild).toHaveStyle({ width: `${2 * 304 + 267}px` })
    expect(container.firstElementChild?.firstElementChild).toHaveTextContent('card')
  })

  it('reports the width of its row, and null when it goes away', () => {
    const onWidthChange = vi.fn()
    const many = Array.from({ length: 18 }, (_, i) => note(`n${i}`))
    const { unmount } = render(
      <SyncGrids
        notes={{ updated: [], deleted: [], unchanged: many }}
        onWidthChange={onWidthChange}
      />,
    )
    expect(onWidthChange).toHaveBeenLastCalledWith(2 * 304 + 267)

    unmount()
    expect(onWidthChange).toHaveBeenLastCalledWith(null)
  })

  it('ends the row at the empty block when the last grid is empty', () => {
    const many = Array.from({ length: 18 }, (_, i) => note(`n${i}`))
    const { container } = render(
      <SyncGrids notes={{ updated: many, deleted: [], unchanged: [] }} />,
    )

    expect(container.firstElementChild).toHaveStyle({ width: `${2 * 304 + 267}px` })
  })

  it('ends the row at the column less the stroke room when every grid is empty', () => {
    const { container } = render(<SyncGrids notes={{ updated: [], deleted: [], unchanged: [] }} />)

    expect(container.firstElementChild).toHaveStyle({ width: `${2 * 304 + 269}px` })
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
    expect(container.firstElementChild?.lastElementChild).toHaveStyle({ columnGap: `${MIN_GAP}px` })
  })

  it('follows the reference cell: spacing for the other grids and a gap in whole spacings', () => {
    latticeCell(20)
    const { container } = render(
      <SyncGrids notes={{ updated: [note('a')], deleted: [], unchanged: [] }} />,
    )

    expect(grids().deleted.cellStep).toBe(20)
    // the column pitch (272 + 32 = 304) rounds up to 15 spacings of 20, so the gap is 300 - 272.
    const pitch = Math.ceil((COLUMN_WIDTH + MIN_GAP) / 20) * 20
    expect(container.firstElementChild?.lastElementChild).toHaveStyle({
      columnGap: `${pitch - COLUMN_WIDTH}px`,
    })
  })
})
