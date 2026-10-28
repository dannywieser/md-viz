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

/** a grid of squares with one horizontal stripe per colour, to judge stripes at small cell sizes. */
export function StripedGrid({ colors, notes, cell, columns }: StripedGridProps) {
  const rows = Math.ceil(notes.length / columns)
  return (
    <svg
      role="img"
      aria-label={`${notes.length} notes, ${cell}px squares`}
      width={columns * cell}
      height={rows * cell}
      shapeRendering="crispEdges"
      className="bg-card shadow-hard"
    >
      {notes.map((indexes, i) => {
        const x = (i % columns) * cell
        const top = Math.floor(i / columns) * cell
        const heights = stripeHeights(cell, indexes.length)
        return heights.map((height, j) => (
          <rect
            key={`${i}-${j}`}
            x={x}
            y={top + heights.slice(0, j).reduce((sum, h) => sum + h, 0)}
            width={cell}
            height={height}
            fill={colors[indexes[j]]}
          />
        ))
      })}
    </svg>
  )
}
