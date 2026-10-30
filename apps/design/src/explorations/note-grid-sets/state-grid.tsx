import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { ownerOutline } from './flow-layout'
import type { GroupStates } from './group-states'
import { GroupToggle } from './group-toggle'
import { BAR_PX, HoverBar } from './hover-bar'
import { LatticeStage } from './lattice-stage'
import { colorVar } from './note-colors'
import type { SizedSet } from './sized-grid'

type StateGridProps = {
  sets: SizedSet[]
  states: GroupStates
  grouped: boolean
  onToggle: () => void
}

const MOVE = '450ms ease-in-out'

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
 * the grid in one of two states, with a toggle in its header bar: grouped (the flowing shapes of
 * iteration 7, outlined) or not (natural order, one size, coloured by set). every note is one
 * square that keeps its identity, so switching moves and resizes each square to its place in the
 * other state with a transition; with more than `MOTION_LIMIT` notes (or when the user prefers
 * reduced motion) they jump and the squares fade in instead, one animation for the whole grid. one pointer handler derives the hovered note from the layout of
 * the current state.
 */
export function StateGrid({ sets, states, grouped, onToggle }: StateGridProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const squares = useRef<SVGGElement>(null)
  const animated = states.order.length <= MOTION_LIMIT && !prefersReducedMotion()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!animated) squares.current?.animate?.([{ opacity: 0 }, { opacity: 1 }], FADE_MS)
  }, [grouped, animated])
  const state = grouped ? states.grouped : states.natural
  const { unit, columns, rows, x0, y0 } = state
  const { width: w, height: h } = states

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const column = Math.floor((event.clientX - box.left - x0) / unit)
    const row = Math.floor((event.clientY - box.top - y0) / unit)
    const inside = column >= 0 && column < columns && row >= 0 && row < rows
    const id = inside ? state.idAt[row * columns + column] : -1
    setHovered(id === -1 ? null : id)
  }

  const g = states.grouped
  const outline = useMemo(
    () => ownerOutline(g.owner, g.columns, g.rows, g.unit),
    [g.owner, g.columns, g.rows, g.unit],
  )
  const square = hovered === null ? null : state.squares[hovered]
  const set = hovered === null ? null : sets[states.order[hovered]]
  const note = hovered === null ? 0 : grouped ? states.noteInSet[hovered] : hovered
  return (
    <LatticeStage cell={unit} width={w} height={h + BAR_PX}>
      <div className="shadow-hard" style={{ width: w }}>
        <HoverBar
          width={w}
          idle={`${sets.length} sets, ${states.order.length} notes`}
          hovered={set && { ...set, note }}
          action={<GroupToggle grouped={grouped} onToggle={onToggle} />}
        />
        <svg
          role="img"
          aria-label={`${grouped ? 'grouped' : 'not grouped'}: ${states.order.length} notes in ${sets.length} sets`}
          width={w}
          height={h}
          shapeRendering="crispEdges"
          className="block overflow-visible bg-card"
          style={{ width: w, height: h }}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHovered(null)}
        >
          <g ref={squares}>
            {state.squares.map((s, id) => (
              <rect
                key={id}
                className={id === 0 ? 'note-square' : undefined}
                width={s.size}
                height={s.size}
                style={{
                  width: s.size,
                  height: s.size,
                  transform: `translate(${x0 + s.x}px, ${y0 + s.y}px)`,
                  fill: colorVar(sets[states.order[id]].color),
                  stroke: 'var(--note-stroke)',
                  transition: animated
                    ? `transform ${MOVE}, width ${MOVE}, height ${MOVE}`
                    : undefined,
                }}
              />
            ))}
          </g>
          <path
            data-outline
            d={outline}
            transform={`translate(${g.x0} ${g.y0})`}
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
              x={x0 + square.x}
              y={y0 + square.y}
              width={square.size}
              height={square.size}
            />
          )}
        </svg>
      </div>
    </LatticeStage>
  )
}
