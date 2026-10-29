import { useMemo, useRef, useState } from 'react'
import { latticeSpacing, makeFakeNotes, NoteGrid, useDotLattice } from '@md-viz/ui'
import { LatticeCode } from './lattice-code'

/** drawing area of the demo grid in px, so the same count always gives the same cell. */
const AREA = { width: 360, height: 200 }

/** the rule the cell fell under, from the spacing it got. */
function rule(cell: number, spacing: number) {
  if (spacing > cell) return `under 16px: a whole multiple of the cell, ${spacing / cell} cells`
  if (spacing < cell) return `over 32px: the cell divided evenly, into ${cell / spacing}`
  return 'from 16 to 32px: the cell itself'
}

/** a note grid on its own dotted box, whose dots are lined up with its squares by the real hook. */
export function LatticeDemo({ count }: { count: number }) {
  const box = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const [cell, setCell] = useState<number | null>(null)
  const notes = useMemo(() => makeFakeNotes(count), [count])
  useDotLattice(grid, cell, box)
  const spacing = cell === null ? null : latticeSpacing(cell)

  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="space-y-3">
        <div ref={box} className="bg-background bg-dots border p-10">
          <div style={{ width: AREA.width }}>
            <NoteGrid
              ref={grid}
              notes={notes}
              label="notes"
              height={AREA.height}
              onCellChange={setCell}
            />
          </div>
        </div>
        {cell !== null && spacing !== null && (
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-muted-foreground">cell</dt>
              <dd>{cell}px</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">dot spacing</dt>
              <dd>{+spacing.toFixed(2)}px</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">rule</dt>
              <dd>{rule(cell, spacing)}</dd>
            </div>
          </dl>
        )}
      </div>
      <div className="min-w-0 flex-1 basis-96">
        <LatticeCode divided={spacing !== null && cell !== null && spacing < cell} />
      </div>
    </div>
  )
}
