import { render, screen } from '@testing-library/react'
import { NoteGrid } from '@md-viz/ui'
import { StatusGrid } from '../../../src/renderer/src/components/status-grid'
import { COLUMN_WIDTH } from '../../../src/shared/window-size'

vi.mock('@md-viz/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@md-viz/ui')>()),
  NoteGrid: vi.fn(() => <div />),
}))

const notes = [{ id: 'a', title: 'plan', tags: [] }]
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
        gridRef={gridRef}
        height={160}
      />,
    )

    expect(screen.getByRole('region', { name: 'updated' })).toHaveStyle({
      width: `${COLUMN_WIDTH}px`,
    })
    expect(lastProps().label).toBe('updated')
    expect(lastProps().sets).toEqual([
      { id: 'updated', name: 'updated', color: 24, notes: [{ id: 'a', title: 'plan' }] },
    ])
  })

  it('fills the height of the column when it has no height', () => {
    const { container } = render(
      <StatusGrid
        label="unchanged"
        notes={notes}
        reference={false}
        onCellChange={vi.fn()}
        gridRef={gridRef}
        height={undefined}
      />,
    )

    expect(container.querySelector('section > div')).toHaveClass('h-full')
  })

  it('lets the reference grid report its cell and hold the ref', () => {
    const onCellChange = vi.fn()
    render(
      <StatusGrid
        label="updated"
        notes={notes}
        reference
        onCellChange={onCellChange}
        gridRef={gridRef}
        height={undefined}
      />,
    )

    expect(lastProps().onCellChange).toBe(onCellChange)
    expect(lastProps().ref).toBe(gridRef)
  })

  it('gives the other grids neither the ref nor the cell callback', () => {
    render(
      <StatusGrid
        label="deleted"
        notes={notes}
        reference={false}
        onCellChange={vi.fn()}
        gridRef={gridRef}
        height={160}
      />,
    )

    expect(lastProps().onCellChange).toBeUndefined()
    expect(lastProps().ref).toBeUndefined()
  })

  it('leaves room for the bar above a fixed drawing height', () => {
    const { container } = render(
      <StatusGrid
        label="deleted"
        notes={notes}
        reference={false}
        onCellChange={vi.fn()}
        gridRef={gridRef}
        height={160}
      />,
    )

    expect(container.querySelector('section > div')).toHaveStyle({ height: '192px' })
  })
})
