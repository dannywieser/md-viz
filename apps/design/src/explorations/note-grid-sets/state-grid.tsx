import { useMemo, useState, type PointerEvent } from 'react'
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

/**
 * the grid in one of two states, with a toggle in its header bar: grouped (the flowing shapes of
 * iteration 7, outlined) or not (natural order, one size, coloured by set). every note is one
 * square that keeps its identity, so switching moves and resizes each square to its place in the
 * other state with a transition. one pointer handler derives the hovered note from the layout of
 * the current state.
 */
export function StateGrid({ sets, states, grouped, onToggle }: StateGridProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const state = grouped ? states.grouped : states.natural
  const { unit, columns, rows } = state
  const w = columns * unit
  const h = rows * unit

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const column = Math.floor((event.clientX - box.left) / unit)
    const row = Math.floor((event.clientY - box.top) / unit)
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
      <div className="shadow-hard" style={{ width: w, transition: `width ${MOVE}` }}>
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
          style={{ width: w, height: h, transition: `width ${MOVE}, height ${MOVE}` }}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHovered(null)}
        >
          {state.squares.map((s, id) => (
            <rect
              key={id}
              className={id === 0 ? 'note-square' : undefined}
              width={s.size}
              height={s.size}
              style={{
                width: s.size,
                height: s.size,
                transform: `translate(${s.x}px, ${s.y}px)`,
                fill: colorVar(sets[states.order[id]].color),
                stroke: 'var(--note-stroke)',
                transition: `transform ${MOVE}, width ${MOVE}, height ${MOVE}`,
              }}
            />
          ))}
          <path
            data-outline
            d={outline}
            fill="none"
            stroke="var(--focus)"
            strokeWidth={2}
            style={{
              opacity: grouped ? 1 : 0,
              transition: `opacity 200ms ease ${grouped ? '300ms' : '0ms'}`,
            }}
          />
          {square && (
            <rect
              className="note-hover"
              x={square.x}
              y={square.y}
              width={square.size}
              height={square.size}
            />
          )}
        </svg>
      </div>
    </LatticeStage>
  )
}
