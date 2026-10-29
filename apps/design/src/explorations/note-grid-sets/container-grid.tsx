import { useMemo, useState, type PointerEvent } from 'react'
import { groupOutline } from './block-shapes'
import { GridTooltip } from './grid-tooltip'
import { LatticeStage } from './lattice-stage'
import { colorVar } from './note-colors'
import { fitContainer } from './slot-sets'
import type { SizedSet } from './sized-grid'

type ContainerGridProps = {
  sets: SizedSet[]
  /** draw a heavier outline around each group. */
  outlined: boolean
  /** the box the container may fill, px. */
  width: number
  height: number
}

/**
 * a container (a floating card block) of empty white squares with the sets slotted into it: every
 * set is a group of squares in its colour, as square as the free space allows (see `slotSets`).
 * the empty squares are one set of gridlines, not one element each; one pointer handler derives
 * the hovered note from the layout.
 */
export function ContainerGrid({ sets, outlined, width, height }: ContainerGridProps) {
  const [hovered, setHovered] = useState<{ set: number; note: number } | null>(null)
  const { sorted, fit } = useMemo(() => {
    const sorted = [...sets].sort((a, b) => b.count - a.count)
    return {
      sorted,
      fit: fitContainer(
        sorted.map((set) => set.count),
        width,
        height,
      ),
    }
  }, [sets, width, height])
  const { cell, columns, rows, slots, owner } = fit
  const w = columns * cell
  const h = rows * cell

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const column = Math.floor((event.clientX - box.left) / cell)
    const row = Math.floor((event.clientY - box.top) / cell)
    const set =
      column >= 0 && column < columns && row >= 0 && row < rows ? owner[row * columns + column] : -1
    if (set === -1) return setHovered(null)
    const slot = slots[set]
    setHovered({ set, note: (row - slot.y) * slot.columns + column - slot.x })
  }

  const slot = hovered && slots[hovered.set]
  const lines = useMemo(() => {
    const vertical = Array.from({ length: columns + 1 }, (_, i) => `M${i * cell},0V${h}`)
    const horizontal = Array.from({ length: rows + 1 }, (_, i) => `M0,${i * cell}H${w}`)
    return [...vertical, ...horizontal].join('')
  }, [cell, columns, rows, w, h])
  return (
    <LatticeStage cell={cell} width={w} height={h}>
      <svg
        role="img"
        aria-label={`${sets.length} sets slotted into a container of ${columns} by ${rows} squares`}
        width={w}
        height={h}
        shapeRendering="crispEdges"
        className="overflow-visible bg-card shadow-hard"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHovered(null)}
      >
        <path d={lines} fill="none" style={{ stroke: 'var(--note-stroke)' }} />
        {sorted.map((set, i) => (
          <g key={set.id} transform={`translate(${slots[i].x * cell} ${slots[i].y * cell})`}>
            {Array.from({ length: set.count }, (_, k) => (
              <rect
                key={k}
                className={i === 0 && k === 0 ? 'note-square' : undefined}
                x={(k % slots[i].columns) * cell}
                y={Math.floor(k / slots[i].columns) * cell}
                width={cell}
                height={cell}
                style={{ fill: colorVar(set.color), stroke: 'var(--note-stroke)' }}
              />
            ))}
            {outlined && (
              <path
                d={groupOutline(set.count, slots[i].columns, cell)}
                fill="none"
                stroke="var(--foreground)"
                strokeWidth={2}
              />
            )}
          </g>
        ))}
        {hovered && slot && (
          <rect
            className="note-hover"
            x={(slot.x + (hovered.note % slot.columns)) * cell}
            y={(slot.y + Math.floor(hovered.note / slot.columns)) * cell}
            width={cell}
            height={cell}
          />
        )}
      </svg>
      {hovered && slot && (
        <GridTooltip
          x={(slot.x + (hovered.note % slot.columns) + 0.5) * cell}
          y={(slot.y + Math.floor(hovered.note / slot.columns)) * cell}
        >
          {sorted[hovered.set].name} note {hovered.note + 1}
        </GridTooltip>
      )}
    </LatticeStage>
  )
}
