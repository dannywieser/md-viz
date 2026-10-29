import { useState } from 'react'
import { Button } from '@md-viz/ui'
import { LatticeDemo } from './lattice-demo'
import { Section } from './section'

const tokens = ['--grid-size', '--grid-dot']

/** note counts that give a cell in each case in the demo's fixed area: over 32px, 16 to 32px and under 16px. */
const presets = [4, 50, 150, 400, 1200, 3000]

export function Grid() {
  const [count, setCount] = useState(presets[2])

  return (
    <Section
      title="grid"
      description="dot grid background: a dot at every cell corner. the densest card sets the cell, other cards use whole multiples of it."
    >
      <div className="flex flex-wrap items-start gap-6">
        <div className="bg-background bg-dots h-[calc(var(--grid-size)*10)] w-[calc(var(--grid-size)*10)] border" />
        <ul className="space-y-1 text-sm">
          {tokens.map((token) => (
            <li key={token}>{token}</li>
          ))}
        </ul>
      </div>
      <h3 className="text-sm font-bold">snapping to the dots</h3>
      <p className="max-w-3xl text-sm text-muted-foreground">
        the more notes a grid holds, the smaller its cell. the dots follow the cell: a cell under
        16px gets a dot on every whole multiple of it, a cell from 16 to 32px a dot on every corner,
        and a bigger one is divided evenly. either way a dot sits on a square corner, and the first
        square's corner is where the dots start. this box lines up its own dots with the real hook,
        rather than the page's.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            size="sm"
            variant={preset === count ? 'default' : 'outline'}
            onClick={() => setCount(preset)}
          >
            {preset} notes
          </Button>
        ))}
      </div>
      <LatticeDemo count={count} />
    </Section>
  )
}
