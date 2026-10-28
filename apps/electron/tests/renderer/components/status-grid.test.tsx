import { render, screen } from '@testing-library/react'
import { NoteGrid } from '@md-viz/ui'
import { StatusGrid } from '../../../src/renderer/src/components/status-grid'
import { COLUMN_WIDTH } from '../../../src/shared/window-size'

vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  NoteGrid: vi.fn(() => <div />),
}))

const notes = [{ id: 'a', title: 'plan' }]
const gridRef = { current: null }
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
        height={160}
        align="start"
      />,
    )

    expect(screen.getByRole('region', { name: 'updated' })).toHaveStyle({
      width: `${COLUMN_WIDTH}px`,
    })
    expect(lastProps()).toMatchObject({
      label: 'updated',
      height: 160,
      align: 'start',
      compactEmpty: true,
    })
    expect(lastProps().notes).toEqual([{ id: 'a', title: 'plan', colors: [] }])
  })

  it('fills the height of the column when it has no height, and can sit at the end of it', () => {
    render(
      <StatusGrid
        label="unchanged"
        notes={notes}
        reference={false}
        onCellChange={vi.fn()}
        cellStep={undefined}
        gridRef={gridRef}
        height={undefined}
        align="end"
      />,
    )

    expect(lastProps().height).toBeUndefined()
    expect(lastProps().align).toBe('end')
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
        height={undefined}
        align="start"
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
        height={160}
        align="start"
      />,
    )

    expect(lastProps().cellStep).toBe(20)
    expect(lastProps().onCellChange).toBeUndefined()
    expect(lastProps().ref).toBeUndefined()
  })
})
