import { PIXEL_ICONS, type PixelIconName } from '../lib/pixel-icons'
import { ACCENT_COLORS } from '../lib/note-colors'

/** a pixel art icon drawn as crisp squares, coloured with the note grid palette. decorative. */
function PixelIcon({ name, cell = 6 }: { name: PixelIconName; cell?: number }) {
  const { rows, palette } = PIXEL_ICONS[name]
  const coloured = palette === 'fill' ? '#' : '+'
  const width = rows[0].length
  return (
    <svg
      data-slot="pixel-icon"
      aria-hidden="true"
      viewBox={`0 0 ${width} ${rows.length}`}
      width={width * cell}
      height={rows.length * cell}
      shapeRendering="crispEdges"
      className="shrink-0"
    >
      {rows.flatMap((row, y) =>
        [...row].flatMap((char, x) => {
          if (char === '.') return []
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              {...(char === coloured
                ? {
                    className: 'note-square',
                    'data-color': y % ACCENT_COLORS,
                    vectorEffect: 'non-scaling-stroke' as const,
                  }
                : { fill: 'var(--foreground)' })}
            />
          )
        }),
      )}
    </svg>
  )
}

export { PixelIcon }
