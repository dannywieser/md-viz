import { useMemo, useState, type PointerEvent } from 'react'
import { BAR_PX, HoverBar } from './hover-bar'
import { LatticeStage } from './lattice-stage'
import { colorVar } from './note-colors'
import { ownerOutline, type FlowFit } from './flow-layout'
import type { SizedSet } from './sized-grid'

type FlowGridProps = {
  /** in the order the fit was made for. */
  sets: SizedSet[]
  fit: FlowFit
}

/**
 * the container of iteration 4 and 5 where the sets are not squares: they flow through the grid
 * (see `flowLayout`) so every cell is a note, with the outline drawn along the edges between sets.
 * one pointer handler derives the hovered note from the layout.
 */
export function FlowGrid({ sets, fit }: FlowGridProps) {
  const [hovered, setHovered] = useState<{ set: number; note: number; cell: number } | null>(null)
  const { cell, columns, rows, owner, note } = fit
  const w = columns * cell
  const h = rows * cell

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const column = Math.floor((event.clientX - box.left) / cell)
    const row = Math.floor((event.clientY - box.top) / cell)
    const index =
      column >= 0 && column < columns && row >= 0 && row < rows ? row * columns + column : -1
    if (index === -1 || owner[index] === -1) return setHovered(null)
    setHovered({ set: owner[index], note: note[index], cell: index })
  }

  const outline = useMemo(
    () => ownerOutline(owner, columns, rows, cell),
    [owner, columns, rows, cell],
  )
  const total = sets.reduce((sum, set) => sum + set.count, 0)
  return (
    <LatticeStage cell={cell} width={w} height={h + BAR_PX}>
      <div className="shadow-hard" style={{ width: w }}>
        <HoverBar
          width={w}
          idle={`${sets.length} sets, ${total} notes`}
          hovered={hovered && { ...sets[hovered.set], note: hovered.note }}
        />
        <svg
          role="img"
          aria-label={`${sets.length} sets in a grid of ${columns} by ${rows} squares`}
          width={w}
          height={h}
          shapeRendering="crispEdges"
          className="block overflow-visible bg-card"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHovered(null)}
        >
          {owner.map((set, index) =>
            set === -1 ? null : (
              <rect
                key={index}
                className={index === 0 ? 'note-square' : undefined}
                x={(index % columns) * cell}
                y={Math.floor(index / columns) * cell}
                width={cell}
                height={cell}
                style={{ fill: colorVar(sets[set].color), stroke: 'var(--note-stroke)' }}
              />
            ),
          )}
          <path d={outline} fill="none" stroke="var(--focus)" strokeWidth={2} />
          {hovered && (
            <rect
              className="note-hover"
              x={(hovered.cell % columns) * cell}
              y={Math.floor(hovered.cell / columns) * cell}
              width={cell}
              height={cell}
            />
          )}
        </svg>
      </div>
    </LatticeStage>
  )
}
