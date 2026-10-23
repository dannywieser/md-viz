import { Logo, Wordmark } from '@md-viz/ui'
import { GLYPHS, layoutPixels } from '@md-viz/ui/lib/pixel-glyphs'
import { Section } from './Section'

const sizes = [1, 2, 4, 8]

/** the glyph sheet: every character on a visible pixel grid. */
function GlyphSheet() {
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

export function LogoSection() {
  return (
    <Section
      title="logo"
      description="pixel art .md mark and md-viz wordmark, built from the same 5 wide bitmap glyphs. the dot of the mark and the viz of the wordmark take the primary color; the wordmark draws each cell as a 2x2 block of small squares."
    >
      <div className="space-y-2">
        <h3 className="text-sm font-bold">wordmark</h3>
        <div className="flex flex-wrap items-center gap-6">
          <div className="bg-card p-4">
            <Wordmark cell={6} />
          </div>
          <div className="bg-dots bg-background p-4">
            <Wordmark cell={3} />
          </div>
          <div className="dark bg-card p-4">
            <Wordmark cell={3} />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-bold">icon</h3>
        <div className="flex flex-wrap items-end gap-6">
          {sizes.map((cell) => (
            <Logo key={cell} cell={cell} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          16 cells square at 1, 2, 4 and 8 px per cell. the favicon is a static copy with fixed
          solarized colors.
        </p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-bold">glyphs</h3>
        <GlyphSheet />
      </div>
    </Section>
  )
}
