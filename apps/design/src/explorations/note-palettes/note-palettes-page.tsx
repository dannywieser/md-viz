import { useState } from 'react'
import { Button } from '@md-viz/ui'
import { candidateThemes, type Mode } from './candidate-themes'
import { ThemePanel } from './theme-panel'

const MODES: Mode[] = ['light', 'dark']

export function NotePalettes() {
  const [mode, setMode] = useState<Mode>('dark')

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl space-y-8 p-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">note palettes</h1>
          <p className="text-sm text-muted-foreground">
            candidate themes for the apps. a theme sets the whole ui (from the mdm palettes) and
            gives 25 note colors: eight accent hues in three tiers (the hue, muted into the theme's
            muted text color, and darkened) in an order that keeps neighbours apart, then the
            neutral grey that untagged notes use. tag colors are stored as indexes, so a tag keeps
            its index when the theme changes. the grids below stripe the squares horizontally (one
            to three tags, every seventh note untagged) at the cell sizes the apps use, to show
            whether stripes read in small squares. themes with one mode show it in both.
          </p>
          <div className="flex gap-2">
            {MODES.map((option) => (
              <Button
                key={option}
                size="sm"
                variant={option === mode ? 'default' : 'outline'}
                onClick={() => setMode(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </header>
        {candidateThemes.map((theme) => (
          <ThemePanel key={theme.id} theme={theme} mode={mode} />
        ))}
      </main>
    </div>
  )
}
