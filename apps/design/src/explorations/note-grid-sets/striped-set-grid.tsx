import { useState, type PointerEvent } from 'react'
import { GridTooltip } from './grid-tooltip'
import { LatticeStage } from './lattice-stage'
import { colorVar, noteColorIndexes, stripeHeights, type ColorMode } from './note-colors'
import { uniformLayout } from './pack-blocks'
import type { SampleNote } from './sample-sets'

type StripedSetGridProps = {
  notes: SampleNote[]
  /** colour the squares by the note's sets or by its tags. */
  mode: ColorMode
  width: number
  height: number
}

/**
 * one square per note, filled row by row, with one horizontal stripe per set or tag (up to three).
 * the colours are the theme's note colours, so the grid follows the theme switcher.
 */
export function StripedSetGrid({ notes, mode, width, height }: StripedSetGridProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const { columns, rows, cell } = uniformLayout(notes.length, width, height)

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const column = Math.floor((event.clientX - box.left) / cell)
    const row = Math.floor((event.clientY - box.top) / cell)
    const index = row * columns + column
    setHovered(column >= 0 && column < columns && row >= 0 && index < notes.length ? index : null)
  }

  const note = hovered === null ? null : notes[hovered]
  return (
    <LatticeStage cell={cell} width={width} height={height}>
      <svg
        role="img"
        aria-label={`${notes.length} notes coloured by ${mode}`}
        width={width}
        height={Math.min(height, rows * cell)}
        shapeRendering="crispEdges"
        className="overflow-visible"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHovered(null)}
      >
        {notes.map((n, i) => {
          const indexes = noteColorIndexes(n, mode)
          const heights = stripeHeights(cell, indexes.length)
          const x = (i % columns) * cell
          const y = Math.floor(i / columns) * cell
          return heights.map((h, j) => (
            <rect
              key={`${n.id}-${j}`}
              className={i === 0 && j === 0 ? 'note-square' : undefined}
              x={x}
              y={y + heights.slice(0, j).reduce((sum, v) => sum + v, 0)}
              width={cell}
              height={h}
              style={{ fill: colorVar(indexes[j]) }}
            />
          ))
        })}
        {hovered !== null && (
          <rect
            className="note-hover"
            x={(hovered % columns) * cell}
            y={Math.floor(hovered / columns) * cell}
            width={cell}
            height={cell}
          />
        )}
      </svg>
      {note && hovered !== null && (
        <GridTooltip
          x={((hovered % columns) + 0.5) * cell}
          y={Math.floor(hovered / columns) * cell}
        >
          {note.title}: {mode === 'set' ? note.sets.join(', ') : note.tags.join(', ') || 'no tags'}
        </GridTooltip>
      )}
    </LatticeStage>
  )
}
