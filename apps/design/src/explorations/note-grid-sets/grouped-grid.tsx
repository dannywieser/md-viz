import { useMemo, useState, type PointerEvent } from 'react'
import { blockShape, groupOutline } from './block-shapes'
import { GridTooltip } from './grid-tooltip'
import { LatticeStage } from './lattice-stage'
import { colorVar } from './note-colors'
import { blockAt, largestCell, packBlocks } from './pack-blocks'
import type { SizedSet } from './sized-grid'

type GroupedGridProps = {
  sets: SizedSet[]
  /** draw a heavier outline around each group; without it the group shows only in colour. */
  outlined: boolean
  width: number
  height: number
}

/**
 * every note is a square again, and a set is a group of them filled row by row into its rectangle
 * (the same packing as the sized blocks, so the groups sit on the same dots) coloured by set.
 * hovering a square names the note.
 */
export function GroupedGrid({ sets, outlined, width, height }: GroupedGridProps) {
  const [hovered, setHovered] = useState<{ set: number; note: number } | null>(null)
  const { sorted, cell, placements } = useMemo(() => {
    const sorted = [...sets].sort((a, b) => b.count - a.count)
    const shapes = sorted.map((set) => blockShape(set.count, 'rectangle'))
    const cell = largestCell(shapes, width, height)
    return { sorted, cell, placements: packBlocks(shapes, Math.floor(width / cell)).placements }
  }, [sets, width, height])

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const column = Math.floor((event.clientX - box.left) / cell)
    const row = Math.floor((event.clientY - box.top) / cell)
    const set = blockAt(placements, column, row)
    const note =
      set === -1
        ? -1
        : (row - placements[set].y) * placements[set].columns + column - placements[set].x
    setHovered(set === -1 || note >= sorted[set].count ? null : { set, note })
  }

  const over = hovered && {
    at: placements[hovered.set],
    title: `${sorted[hovered.set].name} note ${hovered.note + 1}`,
  }
  const overX =
    hovered && placements[hovered.set].x + (hovered.note % placements[hovered.set].columns)
  const overY =
    hovered &&
    placements[hovered.set].y + Math.floor(hovered.note / placements[hovered.set].columns)
  return (
    <LatticeStage cell={cell} width={width} height={height}>
      <svg
        role="img"
        aria-label={`${sets.length} groups of notes at ${cell}px`}
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
            <g key={set.id} transform={`translate(${p.x * cell} ${p.y * cell})`}>
              {Array.from({ length: set.count }, (_, k) => (
                <rect
                  key={k}
                  className={i === 0 && k === 0 ? 'note-square' : undefined}
                  x={(k % p.columns) * cell}
                  y={Math.floor(k / p.columns) * cell}
                  width={cell}
                  height={cell}
                  style={{ fill: colorVar(set.color), stroke: 'var(--note-stroke)' }}
                />
              ))}
              {outlined && (
                <path
                  d={groupOutline(set.count, p.columns, cell)}
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth={2}
                />
              )}
            </g>
          )
        })}
        {over && overX !== null && overY !== null && (
          <rect
            className="note-hover"
            x={overX * cell}
            y={overY * cell}
            width={cell}
            height={cell}
          />
        )}
      </svg>
      {over && overX !== null && overY !== null && (
        <GridTooltip x={(overX + 0.5) * cell} y={overY * cell}>
          {over.title}
        </GridTooltip>
      )}
    </LatticeStage>
  )
}
