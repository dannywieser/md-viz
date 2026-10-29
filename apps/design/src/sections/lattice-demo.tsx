import { useMemo, useRef } from 'react'
import { latticeSpacing, makeFakeNotes, NoteGrid, useDotLattice } from '@md-viz/ui'

/** drawing area of the demo grid in px, so the same count always gives the same cell. */
const AREA = { width: 360, height: 200 }

/** the rule the cell fell under, from the spacing it got. */
function rule(cell: number, spacing: number) {
  if (spacing > cell) return `under 16px: a whole multiple of the cell, ${spacing / cell} cells`
  if (spacing < cell) return `over 32px: the cell divided evenly, into ${cell / spacing}`
  return 'from 16 to 32px: the cell itself'
}

interface LatticeDemoProps {
  count: number
  /** the cell the grid last reported, null before it has. */
  cell: number | null
  onCellChange: (cell: number) => void
}

/** a note grid on its own dotted box, whose dots are lined up with its squares by the real hook. */
export function LatticeDemo({ count, cell, onCellChange }: LatticeDemoProps) {
  const box = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const notes = useMemo(() => makeFakeNotes(count), [count])
  useDotLattice(grid, cell, box)
  const spacing = cell === null ? null : latticeSpacing(cell)

  return (
    <div className="space-y-3">
      <div ref={box} className="bg-background bg-dots flex justify-center border p-10">
        <div style={{ width: AREA.width }}>
          <NoteGrid
            ref={grid}
            notes={notes}
            label="notes"
            height={AREA.height}
            onCellChange={onCellChange}
          />
        </div>
      </div>
      {cell !== null && spacing !== null && (
        <dl className="space-y-1 text-center text-sm">
          <div className="flex justify-center gap-2">
            <dt className="text-muted-foreground">cell</dt>
            <dd>{cell}px</dd>
          </div>
          <div className="flex justify-center gap-2">
            <dt className="text-muted-foreground">dot spacing</dt>
            <dd>{+spacing.toFixed(2)}px</dd>
          </div>
          <div className="flex justify-center gap-2">
            <dt className="text-muted-foreground">rule</dt>
            <dd>{rule(cell, spacing)}</dd>
          </div>
        </dl>
      )}
    </div>
  )
}
