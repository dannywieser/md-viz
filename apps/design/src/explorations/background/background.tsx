import { useState } from 'react'
import { Button } from '@md-viz/ui'
import { BackgroundSwatch } from './background-swatch'
import { variants, type Layout } from './background-variants'

export function Background() {
  const [layout, setLayout] = useState<Layout>('single')
  const [cell, setCell] = useState(16)
  const [strength, setStrength] = useState(1)

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">background</h1>
        <p className="text-sm text-muted-foreground">
          candidates for the page background, each in light and dark behind mock grid cards. with
          several cards the one with the most notes has the smallest cell and sets the dot spacing;
          the others use whole multiples of that cell. only the scaled variant follows the cell.
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          {(['single', 'several'] as const).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={option === layout ? 'default' : 'outline'}
              onClick={() => setLayout(option)}
            >
              {option === 'single' ? 'one card' : 'several cards'}
            </Button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          densest card cell {cell}px
          <input
            type="range"
            min={4}
            max={32}
            value={cell}
            onChange={(event) => setCell(Number(event.target.value))}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          strength {strength.toFixed(1)}x
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={strength}
            onChange={(event) => setStrength(Number(event.target.value))}
          />
        </label>
      </div>
      {variants.map((variant) => (
        <section key={variant.id} className="space-y-3">
          <div>
            <h2 className="text-lg font-bold">{variant.name}</h2>
            <p className="text-sm text-muted-foreground">{variant.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(['light', 'dark'] as const).map((mode) => (
              <BackgroundSwatch
                key={mode}
                variant={variant}
                mode={mode}
                layout={layout}
                cell={cell}
                strength={strength}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
