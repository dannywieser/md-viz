import { act, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { useDotLattice } from '@md-viz/ui'
import { StatusGrid } from '../../src/renderer/src/status-grid'
import { SyncGrids } from '../../src/renderer/src/sync-grids'
import { COLUMN_WIDTH, MIN_GAP } from '../../src/renderer/src/sync-layout'

vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  useDotLattice: vi.fn(),
}))
vi.mock('../../src/renderer/src/status-grid', () => ({
  StatusGrid: vi.fn(({ label }: { label: string }) => <section aria-label={label} />),
}))

const note = (id: string) => ({ id, title: id })
const grids = () =>
  Object.fromEntries(
    vi
      .mocked(StatusGrid)
      .mock.calls.slice(-3)
      .map(([props]) => [props.label, props]),
  ) as Record<string, ComponentProps<typeof StatusGrid>>

describe('SyncGrids', () => {
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

  it('has no lattice and the minimum gap until the reference reports its cell', () => {
    const { container } = render(
      <SyncGrids notes={{ updated: [note('a')], deleted: [], unchanged: [] }} />,
    )

    expect(vi.mocked(useDotLattice).mock.lastCall![1]).toBeNull()
    expect(grids().deleted.cellStep).toBeUndefined()
    expect(container.firstElementChild).toHaveStyle({ columnGap: `${MIN_GAP}px` })
  })

  it('follows the reference cell: spacing for the other grids and a gap in whole spacings', () => {
    const { container } = render(
      <SyncGrids notes={{ updated: [note('a')], deleted: [], unchanged: [] }} />,
    )

    act(() => grids().updated.onCellChange(20))

    expect(vi.mocked(useDotLattice).mock.lastCall![1]).toBe(20)
    expect(grids().deleted.cellStep).toBe(20)
    // the column pitch (272 + 32 = 304) rounds up to 15 spacings of 20, so the gap is 300 - 272.
    const pitch = Math.ceil((COLUMN_WIDTH + MIN_GAP) / 20) * 20
    expect(container.firstElementChild).toHaveStyle({ columnGap: `${pitch - COLUMN_WIDTH}px` })
  })

  it('ignores a reported cell while there are no notes', () => {
    render(<SyncGrids notes={{ updated: [], deleted: [], unchanged: [] }} />)

    act(() => grids().updated.onCellChange(20))

    expect(vi.mocked(useDotLattice).mock.lastCall![1]).toBeNull()
    expect(grids().deleted.cellStep).toBeUndefined()
  })
})
