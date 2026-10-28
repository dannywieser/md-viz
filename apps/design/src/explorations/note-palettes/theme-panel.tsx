import type { CSSProperties } from 'react'
import { Button, Card } from '@md-viz/ui'
import { variantFor, type CandidateTheme, type Mode } from './candidate-themes'
import { ColorStrip } from './color-strip'
import { noteColors } from './derive-note-colors'
import { sampleNotes } from './sample-notes'
import { StripedGrid } from './striped-grid'

/** the cell sizes the stripes are shown at, from the smallest real grid to a roomy one. */
const CELLS = [3, 4, 6, 12]

const NOTES = sampleNotes(168)

type ThemePanelProps = {
  theme: CandidateTheme
  mode: Mode
}

/** one theme in a mode: the app tokens set on a wrapper, a sample of the UI, the note colours and striped grids. */
export function ThemePanel({ theme, mode }: ThemePanelProps) {
  const { ui, hues } = variantFor(theme, mode)
  const colors = noteColors({ ui, hues })
  const only = theme.light && theme.dark ? null : theme.light ? 'light only' : 'dark only'
  const tokens = {
    '--background': ui.background,
    '--foreground': ui.text,
    '--card': ui.panel,
    '--card-foreground': ui.text,
    '--primary': ui.accent,
    '--primary-foreground': ui.background,
    '--secondary': ui.panel,
    '--secondary-foreground': ui.text,
    '--muted': ui.panel,
    '--muted-foreground': ui.muted,
    '--accent': ui.panel,
    '--accent-foreground': ui.text,
    '--border': ui.border,
    '--input': ui.border,
    '--grid-dot': ui.border,
  } as CSSProperties

  return (
    <section
      aria-label={theme.name}
      style={tokens}
      className="space-y-4 border border-border bg-background bg-dots p-6 text-foreground"
    >
      <header className="space-y-1">
        <h2 className="text-lg font-bold">
          {theme.name}
          {only && <span className="ml-2 text-sm font-normal text-muted-foreground">{only}</span>}
        </h2>
        <p className="text-xs text-muted-foreground">{theme.source}</p>
      </header>

      <div className="flex flex-wrap items-start gap-4">
        <Card className="space-y-2 p-4">
          <p className="text-sm font-bold">a card</p>
          <p className="text-xs text-muted-foreground">muted text on the card</p>
          <div className="flex gap-2">
            <Button size="sm">primary</Button>
            <Button size="sm" variant="outline">
              outline
            </Button>
          </div>
        </Card>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            note colors (24 hues in three tiers, then the neutral default)
          </p>
          <ColorStrip colors={colors} />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-6">
        {CELLS.map((cell) => (
          <figure key={cell} className="space-y-2">
            <StripedGrid colors={colors} notes={NOTES} cell={cell} columns={24} />
            <figcaption className="text-xs text-muted-foreground">{cell}px squares</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
