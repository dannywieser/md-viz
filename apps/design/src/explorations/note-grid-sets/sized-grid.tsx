import { useMemo, useState, type PointerEvent } from 'react'
import { BlockLabel } from './block-label'
import { blockShape, type SizeRule } from './block-shapes'
import { GridTooltip } from './grid-tooltip'
import type { LabelMode } from './label-fit'
import { LatticeStage } from './lattice-stage'
import { colorVar } from './note-colors'
import { blockAt, largestCell, packBlocks } from './pack-blocks'

export type SizedSet = { id: string; name: string; count: number; color: number }

type SizedGridProps = {
  sets: SizedSet[]
  rule: SizeRule
  labels: LabelMode
  /** the drawing area, px. */
  width: number
  height: number
}

/**
 * one block per set, as many whole cells as the set has notes (see `blockShape`), packed largest
 * first at the largest whole-px cell that fits, so every edge is on a dot. one pointer handler
 * derives the hovered block from the layout and one tooltip names it.
 */
export function SizedGrid({ sets, rule, labels, width, height }: SizedGridProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const { sorted, cell, placements } = useMemo(() => {
    const sorted = [...sets].sort((a, b) => b.count - a.count)
    const shapes = sorted.map((set) => blockShape(set.count, rule))
    const cell = largestCell(shapes, width, height)
    return { sorted, cell, placements: packBlocks(shapes, Math.floor(width / cell)).placements }
  }, [sets, rule, width, height])

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const column = Math.floor((event.clientX - box.left) / cell)
    const row = Math.floor((event.clientY - box.top) / cell)
    const index = blockAt(placements, column, row)
    setHovered(index === -1 ? null : index)
  }

  const over = hovered === null ? null : { set: sorted[hovered], at: placements[hovered] }
  return (
    <LatticeStage cell={cell} width={width} height={height}>
      <svg
        role="img"
        aria-label={`${sets.length} sets as blocks of ${cell}px cells`}
        width={width}
        height={height}
        shapeRendering="crispEdges"
        className="overflow-visible"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHovered(null)}
      >
        {sorted.map((set, i) => {
          const p = placements[i]
          return (
            <rect
              key={set.id}
              className={i === 0 ? 'note-square' : undefined}
              x={p.x * cell}
              y={p.y * cell}
              width={p.columns * cell}
              height={p.rows * cell}
              style={{ fill: colorVar(set.color), stroke: 'var(--note-stroke)' }}
            />
          )
        })}
        {sorted.map((set, i) => (
          <BlockLabel
            key={set.id}
            mode={labels}
            x={placements[i].x * cell}
            y={placements[i].y * cell}
            width={placements[i].columns * cell}
            height={placements[i].rows * cell}
            text={`${set.name} ${set.count}`}
          />
        ))}
        {over && (
          <rect
            className="note-hover"
            x={over.at.x * cell}
            y={over.at.y * cell}
            width={over.at.columns * cell}
            height={over.at.rows * cell}
          />
        )}
      </svg>
      {over && (
        <GridTooltip x={(over.at.x + over.at.columns / 2) * cell} y={over.at.y * cell}>
          {over.set.name}: {over.set.count} notes, {over.at.columns * over.at.rows} cells
        </GridTooltip>
      )}
    </LatticeStage>
  )
}
