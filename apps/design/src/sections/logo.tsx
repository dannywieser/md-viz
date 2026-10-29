import { Logo, Wordmark } from '@md-viz/ui'
import { GlyphSheet } from './glyph-sheet'
import { Section } from './section'

const sizes = [1, 2, 4, 8]

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
          <div className="bg-muted p-4">
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
