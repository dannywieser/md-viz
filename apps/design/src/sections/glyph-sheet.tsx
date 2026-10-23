import { GLYPHS, layoutPixels } from '@md-viz/ui/lib/pixel-glyphs'

/** the glyph sheet: every character on a visible pixel grid. */
export function GlyphSheet() {
  return (
    <div className="flex flex-wrap gap-4">
      {Object.keys(GLYPHS).map((char) => {
        const { rects, width, height } = layoutPixels(char)
        return (
          <svg
            key={char}
            role="img"
            aria-label={`glyph ${char}`}
            viewBox={`0 0 ${width} ${height}`}
            width={width * 8}
            height={height * 8}
            shapeRendering="crispEdges"
            className="bg-card text-foreground"
          >
            {rects.map(({ x, y }) => (
              <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
            ))}
          </svg>
        )
      })}
    </div>
  )
}
