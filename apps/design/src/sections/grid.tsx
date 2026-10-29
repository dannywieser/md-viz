import { useState } from 'react'
import { Button } from '@md-viz/ui'
import { LatticeDemo } from './lattice-demo'
import { Section } from './section'

const tokens = ['--grid-size', '--grid-dot']

/** note counts that give a cell in each case in the demo's fixed area: over 32px, 16 to 32px and under 16px. */
const presets = [4, 50, 150, 400, 1200, 3000]

/** how the dots are spaced, a sentence a line. */
const intro = [
  'note grids have a fixed height and width.',
  'as the number of notes increases, the size of each cell is decreased.',
  'the dots on the page are spaced to match the note grid shown.',
]

/** the dot spacing for each size of cell. */
const rules = [
  'under 16px, a dot lands on every whole multiple of the cell that reaches 16px: a 7px cell gets a dot every 21px.',
  'from 16px to 32px, a dot lands on every cell corner: a 21px cell gets a dot every 21px.',
  'over 32px, each cell is divided into equal parts until the dots are 32px or less apart: a 98px cell gets a dot every 24.5px.',
]

const closing =
  "either way a dot sits on a square corner, and the first square's corner is where the dots start."

const demoNote = "this box lines up its own dots with the real hook, rather than the page's."

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
      <div className="space-y-1 text-center text-sm text-muted-foreground">
        {intro.map((sentence) => (
          <p key={sentence}>{sentence}</p>
        ))}
      </div>
      <ul className="mx-auto w-fit list-disc space-y-1 pl-5 text-left text-sm text-muted-foreground">
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <p className="text-center text-sm text-muted-foreground">{closing}</p>
      <h3 className="text-sm font-bold">demo</h3>
      <p className="text-center text-sm text-muted-foreground">{demoNote}</p>
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
