import * as React from 'react'
import { cn } from 'cn'
import { layoutGrid } from '../lib/note-grid-layout'
import { useElementSize } from '../lib/use-element-size'

export const NOTE_COLORS = 10

export type Note = {
  id: string
  title: string
  /** index into the note palette; wraps around after NOTE_COLORS. */
  color: number
}

type NoteGridProps = {
  notes: Note[]
  /** height of the drawing area in px; squares shrink so every note fits inside it. Omit to fill the container's height. */
  height?: number
  /** wraps the drawn grid, e.g. in a card that hugs it; see `inset`. */
  frame?: (grid: React.ReactNode) => React.ReactNode
  /** px the frame adds on each side of the grid; kept out of the space the grid is laid out in. */
  inset?: number
  /** use only whole multiples of this cell, so grids next to each other share a lattice. */
  cellStep?: number
  /** called with the cell size (px) whenever the layout changes it. */
  onCellChange?: (cell: number) => void
  className?: string
}

type CellsProps = { notes: Note[]; columns: number; cell: number }

/** the squares and placeholders; memoised so a hover change does not re-render thousands of rects. */
const Cells = React.memo(function Cells({ notes, columns, cell }: CellsProps) {
  const rows = Math.ceil(notes.length / columns)
  const placeholders = columns * rows - notes.length
  const cellX = (i: number) => (i % columns) * cell + 1.5
  const cellY = (i: number) => Math.floor(i / columns) * cell + 1.5
  return (
    <>
      {notes.map((note, i) => (
        <rect
          key={note.id}
          className="note-square"
          data-color={((note.color % NOTE_COLORS) + NOTE_COLORS) % NOTE_COLORS}
          x={cellX(i)}
          y={cellY(i)}
          width={cell}
          height={cell}
        />
      ))}
      {Array.from({ length: placeholders }, (_, k) => (
        <rect
          key={`placeholder-${k}`}
          className="note-placeholder"
          x={cellX(notes.length + k)}
          y={cellY(notes.length + k)}
          width={cell}
          height={cell}
        />
      ))}
    </>
  )
})

function NoteGrid({
  notes,
  height: fixedHeight,
  frame,
  inset = 0,
  cellStep,
  onCellChange,
  className,
}: NoteGridProps) {
  const areaRef = React.useRef<HTMLDivElement>(null)
  const size = useElementSize(areaRef)
  const width = Math.max(0, size.width - 2 * inset)
  const height = Math.max(0, (fixedHeight ?? size.height) - 2 * inset)
  const [hovered, setHovered] = React.useState<number | null>(null)
  const { columns, rows, cell } = layoutGrid({
    count: notes.length,
    width,
    height,
    multipleOf: cellStep,
  })
  React.useEffect(() => {
    if (notes.length > 0 && width > 0 && height > 0) onCellChange?.(cell)
  }, [cell, notes.length, width, height, onCellChange])
  const gridWidth = columns * cell
  const gridHeight = rows * cell
  const cellX = (i: number) => (i % columns) * cell + 1.5
  const cellY = (i: number) => Math.floor(i / columns) * cell + 1.5
  const active = hovered !== null && hovered < notes.length ? hovered : null

  // one handler for the whole grid: the cell under the pointer follows from the uniform layout.
  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - box.left - 1.5
    const y = event.clientY - box.top - 1.5
    const column = Math.floor(x / cell)
    const row = Math.floor(y / cell)
    const inside = x >= 0 && y >= 0 && column < columns && row < rows
    const index = row * columns + column
    setHovered(inside && index < notes.length ? index : null)
  }

  const grid = (
    <div className="relative shrink-0">
      <svg
        role="img"
        aria-label={`${notes.length} notes`}
        width={gridWidth + 3}
        height={gridHeight + 3}
        className="overflow-visible"
        shapeRendering="crispEdges"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHovered(null)}
      >
        <Cells notes={notes} columns={columns} cell={cell} />
        {active !== null && (
          <rect
            className="note-hover"
            x={cellX(active) - 0.5}
            y={cellY(active) - 0.5}
            width={cell}
            height={cell}
          />
        )}
      </svg>
      {active !== null && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap border bg-card px-2 py-1 text-xs text-card-foreground shadow-hard"
          style={{ left: cellX(active) + cell / 2, top: cellY(active) - 8 }}
        >
          {notes[active].title}
        </div>
      )}
    </div>
  )

  return (
    <div
      ref={areaRef}
      data-slot="note-grid"
      className={cn(
        'flex w-full items-center justify-center',
        fixedHeight === undefined && 'h-full',
        className,
      )}
      style={fixedHeight === undefined ? undefined : { height: fixedHeight }}
    >
      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">no notes</p>
      ) : (
        width > 0 && height > 0 && (frame ? frame(grid) : grid)
      )}
    </div>
  )
}

export { NoteGrid }
