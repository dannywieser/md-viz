import { useState, type PointerEvent } from 'react'
import { stripeHeights } from './stripes'

type StripedGridProps = {
  /** the note colours, in index order. */
  colors: string[]
  /** the colour indexes of every note: one to three stripes each. */
  notes: number[][]
  /** px per square. */
  cell: number
  columns: number
}

/**
 * a grid of squares with one horizontal stripe per colour, to judge stripes at small cell sizes.
 * hovering a square outlines it (as the note grid does) and names its colours.
 */
export function StripedGrid({ colors, notes, cell, columns }: StripedGridProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const rows = Math.ceil(notes.length / columns)
  const cellX = (i: number) => (i % columns) * cell
  const cellY = (i: number) => Math.floor(i / columns) * cell

  // one handler for the whole grid: the square under the pointer follows from the uniform layout.
  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const column = Math.floor((event.clientX - box.left) / cell)
    const row = Math.floor((event.clientY - box.top) / cell)
    const index = row * columns + column
    setHovered(column >= 0 && column < columns && row >= 0 && index < notes.length ? index : null)
  }

  return (
    <div className="relative">
      <svg
        role="img"
        aria-label={`${notes.length} notes, ${cell}px squares`}
        width={columns * cell}
        height={rows * cell}
        shapeRendering="crispEdges"
        className="overflow-visible bg-card shadow-hard"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHovered(null)}
      >
        {notes.map((indexes, i) => {
          const heights = stripeHeights(cell, indexes.length)
          return heights.map((height, j) => (
            <rect
              key={`${i}-${j}`}
              x={cellX(i)}
              y={cellY(i) + heights.slice(0, j).reduce((sum, h) => sum + h, 0)}
              width={cell}
              height={height}
              fill={colors[indexes[j]]}
            />
          ))
        })}
        {hovered !== null && (
          <rect
            className="note-hover"
            x={cellX(hovered)}
            y={cellY(hovered)}
            width={cell}
            height={cell}
          />
        )}
      </svg>
      {hovered !== null && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap border bg-card px-2 py-1 text-xs text-card-foreground shadow-hard"
          style={{ left: cellX(hovered) + cell / 2, top: cellY(hovered) - 8 }}
        >
          note {hovered}: color {notes[hovered].join(', ')}
        </div>
      )}
    </div>
  )
}
