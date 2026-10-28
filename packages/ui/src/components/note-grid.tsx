/* eslint-disable react/no-multi-comp -- `Cells`, the memo'd item layer, is internal to the grid and stays beside it (agreed exception). */
import * as React from 'react'
import { cn } from 'cn'
import { Card } from './card'
import { EmptyState } from './empty-state'
import { DEFAULT_NOTE_COLOR, NOTE_COLORS } from '../lib/note-colors'
import { STROKE_ROOM, layoutGrid } from '../lib/note-grid-layout'
import { tooltipShift } from '../lib/tooltip-shift'
import { useElementSize } from '../hooks/use-element-size'

export { NOTE_COLORS, DEFAULT_NOTE_COLOR }

export type Note = {
  id: string
  title: string
  /** index into the note palette; wraps around after NOTE_COLORS. */
  color: number
}

type NoteGridProps = {
  /** the grid blocks, one square per note. An empty array shows the empty state instead. */
  notes: Note[]
  /** height of the drawing area in px; squares shrink so every note fits inside it. Omit to fill the container's height. */
  height?: number
  /** shown on a small card hanging above the grid, with the note count; room for it is added above the drawing area. */
  label?: string
  /** where the grid sits in its container; the container is the drawing area, so a grid that does not fill it floats in it: `start` pins it to the top-left, `end` to the top-right. */
  align?: 'center' | 'start' | 'end'
  /** use only whole multiples of this cell, so grids next to each other share a lattice. */
  cellStep?: number
  /** show the compact empty state (small muted ghost, no text) when there are no notes. */
  compactEmpty?: boolean
  /** size (px) of the empty block, e.g. to match a populated grid next to it. Omit to fill the drawing area less the stroke room. */
  emptySize?: { width: number; height: number }
  /** called with the cell size (px) whenever the layout changes it. */
  onCellChange?: (cell: number) => void
  /** the grid block (the shadowed element holding the squares), e.g. to line the page's dots up with it. */
  ref?: React.Ref<HTMLDivElement>
  className?: string
}

/** how the grid sits in its container for each `align`. */
const ALIGN_CLASSES = {
  center: 'items-center justify-center',
  start: 'items-start justify-start',
  end: 'items-start justify-end',
}

/** px kept between the tooltip and the window edge. */
const TOOLTIP_MARGIN = 8

/** px reserved above the drawing area for the label card: one text line, its padding and border, and a gap. */
const LABEL_ROOM = 42

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
  label,
  align = 'center',
  cellStep,
  compactEmpty = false,
  emptySize,
  onCellChange,
  ref,
  className,
}: NoteGridProps) {
  const areaRef = React.useRef<HTMLDivElement>(null)
  const size = useElementSize(areaRef)
  const width = Math.max(0, size.width - STROKE_ROOM)
  const height = Math.max(0, (fixedHeight ?? size.height) - STROKE_ROOM)
  const [hovered, setHovered] = React.useState<number | null>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)
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

  // the one shared tooltip is centred on its cell; near a window edge it is moved sideways just enough to stay on screen.
  // the room is the viewport less any scrollbar (clientWidth, not innerWidth): a tooltip reaching under a scrollbar would overflow the page, which adds the scrollbar and resizes the grid, and the tooltip flickers.
  React.useLayoutEffect(() => {
    const tooltip = tooltipRef.current
    if (!tooltip) return
    tooltip.style.marginLeft = '0px'
    const { left, width } = tooltip.getBoundingClientRect()
    tooltip.style.marginLeft = `${tooltipShift(left, width, document.documentElement.clientWidth, TOOLTIP_MARGIN)}px`
  }, [active, notes])

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

  // the grid is always a shadowed block floating on the page, never inside a card; the label card hangs above it.
  const block = (content: React.ReactNode, extra?: string, style?: React.CSSProperties) => (
    <div ref={ref} className={cn('relative shrink-0 bg-card shadow-hard', extra)} style={style}>
      {label && (
        <Card className="absolute inset-x-0 bottom-full mb-3 flex-row items-baseline gap-2 whitespace-nowrap px-3 py-1 text-sm font-bold">
          {label} <span className="font-normal text-muted-foreground">{notes.length}</span>
        </Card>
      )}
      {content}
    </div>
  )

  const grid = block(
    <>
      <svg
        role="img"
        aria-label={`${notes.length} notes`}
        width={gridWidth + STROKE_ROOM}
        height={gridHeight + STROKE_ROOM}
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
          ref={tooltipRef}
          role="tooltip"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap border bg-card px-2 py-1 text-xs text-card-foreground shadow-hard"
          style={{ left: cellX(active) + cell / 2, top: cellY(active) - 8 }}
        >
          {notes[active].title}
        </div>
      )}
    </>,
  )

  // an empty block is `emptySize`, else it fills the drawing area (less the stroke room), so it is never bigger than its container.
  const empty = block(
    <EmptyState compact={compactEmpty} />,
    'flex items-center justify-center',
    emptySize ?? (width > 0 && height > 0 ? { width, height } : undefined),
  )

  return (
    <div
      data-slot="note-grid"
      className={cn('flex w-full flex-col', fixedHeight === undefined && 'h-full', className)}
      style={{
        ...(fixedHeight === undefined
          ? undefined
          : { height: fixedHeight + (label ? LABEL_ROOM : 0) }),
        ...(label ? { paddingTop: LABEL_ROOM } : undefined),
      }}
    >
      <div ref={areaRef} className={cn('flex min-h-0 w-full flex-1', ALIGN_CLASSES[align])}>
        {notes.length === 0 ? empty : width > 0 && height > 0 && grid}
      </div>
    </div>
  )
}

export { NoteGrid }
