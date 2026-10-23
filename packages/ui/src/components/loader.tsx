import { useState } from 'react'
import { loaderFills, type LoaderFill } from '../lib/loader-fills'
import { NOTE_COLORS } from '../lib/note-colors'

const STEP = 0.06
const HOLD = 0.8
const GAP = 0.3
/** how long a dropping square takes to fall to its place. */
const FALL = 0.25
/** squares per colour in the note palette, so the fill reads as pieces. */
const PIECE = 4

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const pickFill = () => loaderFills[Math.floor(Math.random() * loaderFills.length)]

interface LoaderProps {
  /** what the loader announces; nothing is shown as text. */
  label?: string
  /** how the squares fill the well. Omit to pick one at random when the loader mounts and keep it. */
  fill?: LoaderFill
  cols?: number
  rows?: number
  /** edge length of one square in px. */
  cell?: number
}

/** a well filling with note-coloured squares, then emptying and starting again; only an aria label, no text. */
function Loader({ label = 'loading', fill, cols = 8, rows = 6, cell = 8 }: LoaderProps) {
  const [picked] = useState(pickFill)
  const chosen = fill ?? picked
  const ranks = chosen.rank(cols, rows)
  const count = cols * rows
  const fall = chosen.drop ? FALL : 0
  const total = count * STEP + fall + HOLD + GAP
  const off = (count * STEP + fall + HOLD) / total
  const still = prefersReducedMotion()
  return (
    <svg
      data-slot="loader"
      role="status"
      aria-label={label}
      viewBox={`0 0 ${cols + 2} ${rows + 1}`}
      width={(cols + 2) * cell}
      height={(rows + 1) * cell}
      shapeRendering="crispEdges"
      className="shrink-0"
    >
      <rect width={1} height={rows + 1} fill="var(--foreground)" />
      <rect x={cols + 1} width={1} height={rows + 1} fill="var(--foreground)" />
      <rect y={rows} width={cols + 2} height={1} fill="var(--foreground)" />
      {ranks.map((rank, i) => {
        const start = ((rank + 1) * STEP) / total
        const landing = Math.floor(i / cols)
        return (
          <rect
            key={i}
            className="note-square"
            data-color={Math.floor(rank / PIECE) % NOTE_COLORS}
            vectorEffect="non-scaling-stroke"
            x={(i % cols) + 1}
            y={landing}
            width={1}
            height={1}
            opacity={still && rank < count / 2 ? 1 : 0}
          >
            {!still && (
              <animate
                attributeName="opacity"
                calcMode="discrete"
                values="0;1;0;0"
                keyTimes={`0;${start};${off};1`}
                dur={`${total}s`}
                repeatCount="indefinite"
              />
            )}
            {!still && chosen.drop && (
              <animate
                attributeName="y"
                values={`0;0;${landing};${landing}`}
                keyTimes={`0;${start};${start + fall / total};1`}
                dur={`${total}s`}
                repeatCount="indefinite"
              />
            )}
          </rect>
        )
      })}
    </svg>
  )
}

export { Loader }
