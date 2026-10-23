import { render, screen } from '@testing-library/react'
import { NoteGrid } from '@md-viz/ui'
import { StatusGrid } from '../../../src/renderer/src/components/status-grid'
import { COLUMN_WIDTH, GRID_HEIGHT } from '../../../src/renderer/src/lib/sync-layout'

vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  NoteGrid: vi.fn(() => <div />),
}))

const notes = [{ id: 'a', title: 'plan' }]
const gridRef = { current: null }
const size = { width: 267, height: 135 }
const lastProps = () => vi.mocked(NoteGrid).mock.lastCall![0]

describe('StatusGrid', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('is a labelled column of the fixed width', () => {
    render(
      <StatusGrid
        label="updated"
        notes={notes}
        reference={false}
        onCellChange={vi.fn()}
        cellStep={undefined}
        gridRef={gridRef}
        emptySize={size}
      />,
    )

    expect(screen.getByRole('region', { name: 'updated' })).toHaveStyle({
      width: `${COLUMN_WIDTH}px`,
    })
    expect(lastProps()).toMatchObject({
      label: 'updated',
      height: GRID_HEIGHT,
      align: 'start',
      compactEmpty: true,
      emptySize: size,
    })
    expect(lastProps().notes).toEqual([{ id: 'a', title: 'plan', color: 0 }])
  })

  it('lets the reference grid report its cell and hold the ref', () => {
    const onCellChange = vi.fn()
    render(
      <StatusGrid
        label="updated"
        notes={notes}
        reference
        onCellChange={onCellChange}
        cellStep={20}
        gridRef={gridRef}
        emptySize={size}
      />,
    )

    expect(lastProps().onCellChange).toBe(onCellChange)
    expect(lastProps().ref).toBe(gridRef)
    expect(lastProps().cellStep).toBeUndefined()
  })

  it('has the other grids follow whole multiples of the reference cell', () => {
    render(
      <StatusGrid
        label="deleted"
        notes={notes}
        reference={false}
        onCellChange={vi.fn()}
        cellStep={20}
        gridRef={gridRef}
        emptySize={size}
      />,
    )

    expect(lastProps().cellStep).toBe(20)
    expect(lastProps().onCellChange).toBeUndefined()
    expect(lastProps().ref).toBeUndefined()
  })
})
