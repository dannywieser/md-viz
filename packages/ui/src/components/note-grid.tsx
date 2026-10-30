import * as React from 'react'
import { cn } from 'cn'
import { EmptyState } from './empty-state'
import { GroupToggle } from './group-toggle'
import { BAR_PX, NoteGridBar } from './note-grid-bar'
import { NoteGridSquares } from './note-grid-squares'
import { useElementSize } from '../hooks/use-element-size'
import { groupStates } from '../lib/grid-layout/group-states'
import { buildGridModel, type GridSet } from '../lib/grid-layout/grid-model'

export type { GridNote, GridSet } from '../lib/grid-layout/grid-model'

type NoteGridProps = {
  /** the notes by set, one square per note, coloured by its set. Empty sets are left out; no notes at all shows the empty state. */
  sets: GridSet[]
  /** shown in the bar while nothing is hovered, before the totals. */
  label?: string
  /** called with the cell size (px) of the state shown (and when the layout changes it). */
  onCellChange?: (cell: number) => void
  /** the grid block (the shadowed element holding the bar and the squares), e.g. to line the page's dots up with it. */
  ref?: React.Ref<HTMLDivElement>
  className?: string
}

/** above this many notes the squares do not move one by one (thousands of transitions are too heavy): the grid fades instead. */
export const MOTION_LIMIT = 1000
const FADE_MS = 250

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * the notes as a grid of squares in a shadowed block that fills its container, floating on the page
 * and never inside a card. a bar across its top shows the totals, or the hovered note and its set,
 * and holds a toggle between two states: not grouped (the default; every note the same size in the
 * order of their ids, coloured by set) and grouped (the sets as outlined flowing shapes, the
 * squares of the smaller sets bigger). both fill the same frame, so the block never changes size;
 * every note is one square that keeps its identity, so switching moves and resizes each square
 * (above `MOTION_LIMIT` notes, or with reduced motion, the grid fades instead). one pointer handler
 * derives the hovered note from the layout of the current state.
 */
function NoteGrid({ sets, label, onCellChange, ref, className }: NoteGridProps) {
  const areaRef = React.useRef<HTMLDivElement>(null)
  const size = useElementSize(areaRef)
  const width = size.width
  const height = Math.max(0, size.height - BAR_PX)
  const [grouped, setGrouped] = React.useState(false)
  const [hovered, setHovered] = React.useState<number | null>(null)
  const squaresRef = React.useRef<SVGGElement>(null)

  const model = React.useMemo(() => buildGridModel(sets), [sets])
  const total = model.notes.length
  const ready = total > 0 && width > 0 && height > 0
  const states = React.useMemo(
    () => (ready ? groupStates(model.counts, model.order, width, height) : null),
    [ready, model, width, height],
  )
  const colors = React.useMemo(() => model.order.map((set) => model.sets[set].color), [model])
  const animated = total <= MOTION_LIMIT && !prefersReducedMotion()

  const state = states && (grouped ? states.grouped : states.natural)
  const unit = state?.unit
  React.useEffect(() => {
    if (unit !== undefined) onCellChange?.(unit)
  }, [unit, onCellChange])

  // a switch fades the grid in when the squares do not move one by one.
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!animated) squaresRef.current?.animate?.([{ opacity: 0 }, { opacity: 1 }], FADE_MS)
  }, [grouped, animated])

  const lines = React.useMemo(() => {
    if (!state) return ''
    const { columns, rows, unit: cell } = state
    const vertical = Array.from({ length: columns + 1 }, (_, i) => `M${i * cell},0V${rows * cell}`)
    const horizontal = Array.from(
      { length: rows + 1 },
      (_, i) => `M0,${i * cell}H${columns * cell}`,
    )
    return [...vertical, ...horizontal].join('')
  }, [state])

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!state) return
    const box = event.currentTarget.getBoundingClientRect()
    const column = Math.floor((event.clientX - box.left - state.x0) / state.unit)
    const row = Math.floor((event.clientY - box.top - state.y0) / state.unit)
    const inside = column >= 0 && column < state.columns && row >= 0 && row < state.rows
    const id = inside ? state.idAt[row * state.columns + column] : -1
    setHovered(id === -1 ? null : id)
  }

  const square = states && state && hovered !== null ? state.squares[hovered] : null
  const note = hovered === null ? null : model.notes[hovered]
  const set = hovered === null ? null : model.sets[model.order[hovered]]
  const idle = `${label ? `${label}: ` : ''}${total} notes in ${model.sets.length} sets`

  return (
    <div
      data-slot="note-grid"
      ref={areaRef}
      className={cn('flex h-full w-full items-start justify-start', className)}
    >
      {total === 0 && width > 0 && size.height > 0 && (
        <div
          ref={ref}
          className="flex shrink-0 items-center justify-center bg-card shadow-hard"
          style={{ width, height: size.height }}
        >
          <EmptyState />
        </div>
      )}
      {states && state && (
        <div ref={ref} className="shrink-0 bg-card shadow-hard" style={{ width }}>
          <NoteGridBar
            width={width}
            idle={idle}
            hovered={note && set && { title: note.title, setName: set.name, color: set.color }}
            action={
              <GroupToggle grouped={grouped} onToggle={() => setGrouped((value) => !value)} />
            }
          />
          <svg
            role="img"
            aria-label={`${grouped ? 'grouped' : 'not grouped'}: ${total} notes in ${model.sets.length} sets`}
            width={width}
            height={height}
            shapeRendering="crispEdges"
            className="block overflow-visible bg-card"
            style={{ width, height }}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHovered(null)}
          >
            <path
              data-gridlines
              d={lines}
              transform={`translate(${state.x0} ${state.y0})`}
              fill="none"
              style={{ stroke: 'var(--note-stroke)' }}
            />
            {/* the page's dots line up with this square: it never moves, unlike the first note's. */}
            <rect
              className="note-square"
              x={state.x0}
              y={state.y0}
              width={state.unit}
              height={state.unit}
              style={{ fill: 'none', stroke: 'none', pointerEvents: 'none' }}
            />
            <g ref={squaresRef}>
              <NoteGridSquares
                squares={state.squares}
                colors={colors}
                x0={state.x0}
                y0={state.y0}
                animated={animated}
              />
            </g>
            <path
              data-outline
              d={states.grouped.outline}
              transform={`translate(${states.grouped.x0} ${states.grouped.y0})`}
              fill="none"
              stroke="var(--focus)"
              strokeWidth={2}
              style={{
                opacity: grouped ? 1 : 0,
                transition: `opacity 200ms ease ${grouped && animated ? '300ms' : '0ms'}`,
              }}
            />
            {square && (
              <rect
                className="note-hover"
                x={state.x0 + square.x}
                y={state.y0 + square.y}
                width={square.size}
                height={square.size}
              />
            )}
          </svg>
        </div>
      )}
    </div>
  )
}

export { NoteGrid }
