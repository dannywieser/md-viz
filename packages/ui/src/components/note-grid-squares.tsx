import * as React from 'react'
import type { Square } from '../lib/grid-layout/group-states'
import { colorVar } from '../lib/note-colors'

/** how a square moves to its place in the other state. */
const MOVE = '450ms ease-in-out'

type NoteGridSquaresProps = {
  /** per natural note: where its square is, in px from the grid's corner. */
  squares: Square[]
  /** per natural note: the palette colour of its set. */
  colors: number[]
  /** px: where the grid starts in the frame. */
  x0: number
  y0: number
  /** whether the squares move (transition) to a new place, or jump. */
  animated: boolean
}

/** the squares, one `rect` per note; memoised so a hover change does not re-render thousands of them. */
export const NoteGridSquares = React.memo(function NoteGridSquares({
  squares,
  colors,
  x0,
  y0,
  animated,
}: NoteGridSquaresProps) {
  return (
    <>
      {squares.map((square, id) => (
        <rect
          key={id}
          width={square.size}
          height={square.size}
          style={{
            width: square.size,
            height: square.size,
            transform: `translate(${x0 + square.x}px, ${y0 + square.y}px)`,
            fill: colorVar(colors[id]),
            stroke: 'var(--note-stroke)',
            transition: animated ? `transform ${MOVE}, width ${MOVE}, height ${MOVE}` : undefined,
          }}
        />
      ))}
    </>
  )
})
