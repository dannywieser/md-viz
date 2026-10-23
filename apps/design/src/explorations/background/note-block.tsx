import { modes, type Mode } from './background-variants'

// the squares cycle through these tones.
const SQUARE_TONES = ['#cb4b16', '#b58900', '#859900', '#2aa198', '#268bd2', '#93a1a1']

export function NoteBlock({
  mode,
  cell,
  columns,
  rows,
}: {
  mode: Mode
  cell: number
  columns: number
  rows: number
}) {
  const { card, dot } = modes[mode]
  return (
    <div
      className="grid shrink-0"
      style={{ gridTemplateColumns: `repeat(${columns}, ${cell}px)` }}
      aria-hidden="true"
    >
      {Array.from({ length: columns * rows }, (_, i) => (
        <div
          key={i}
          style={{
            width: cell,
            height: cell,
            background: `color-mix(in srgb, ${SQUARE_TONES[(i * 7 + (i >> 2)) % SQUARE_TONES.length]} 55%, ${dot})`,
            outline: `1px solid color-mix(in srgb, ${dot} 60%, ${card})`,
            outlineOffset: -1,
          }}
        />
      ))}
    </div>
  )
}
