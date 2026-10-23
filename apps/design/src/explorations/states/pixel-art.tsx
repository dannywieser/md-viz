import { NOTE_COLORS } from '@md-viz/ui'
import type { NotePalette } from './icon-options'

/** a bitmap drawn as crisp squares: '#' in the foreground color, '+' in the accent. */
export function PixelArt({
  rows,
  cell = 6,
  accent = 'var(--primary)',
  notePalette,
}: {
  rows: readonly string[]
  cell?: number
  accent?: string
  /** colours the '#' cells (`fill`) or the '+' cells (`accent`) like the note grid, a colour per row. */
  notePalette?: NotePalette
}) {
  const width = rows[0]?.length ?? 0
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${rows.length}`}
      width={width * cell}
      height={rows.length * cell}
      shapeRendering="crispEdges"
      className="shrink-0"
    >
      {rows.flatMap((row, y) =>
        [...row].flatMap((char, x) =>
          char === '.' ? (
            []
          ) : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              {...(notePalette && char === (notePalette === 'fill' ? '#' : '+')
                ? {
                    className: 'note-square',
                    'data-color': y % NOTE_COLORS,
                    vectorEffect: 'non-scaling-stroke' as const,
                  }
                : { fill: char === '+' ? accent : 'var(--foreground)' })}
            />
          ),
        ),
      )}
    </svg>
  )
}
