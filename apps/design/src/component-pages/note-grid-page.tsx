import { useMemo, useState } from 'react'
import { Button, makeFakeSets, NoteGrid } from '@md-viz/ui'
import { DemoBox } from './demo-box'
import { DemoGroup } from './demo-group'
import { PageHeading } from './page-heading'

const presets = [5, 50, 500, 5000]
const setCounts = [1, 3, 8, 12]
const MAX_COUNT = 20000

// the states a grid can be in, each shown at the same width as a status column in the apps.
const states = [
  { label: 'one', total: 1, sets: 1 },
  { label: 'a few', total: 5, sets: 2 },
  { label: 'many', total: 500, sets: 4 },
  { label: 'empty', total: 0, sets: 0 },
]

// sets of very different sizes, like the sync sets of a real cache.
const unevens = [
  { label: 'two and thousands', counts: [2, 4862] },
  { label: 'seven sets', counts: [2740, 1142, 525, 274, 205, 91, 23] },
]

/** `total` notes split over `sets` sets, the first the biggest (shares 1, 1/2, 1/3...) and none empty, so the board looks the same on every load. */
function splitCounts(total: number, sets: number): number[] {
  const count = Math.min(sets, total)
  if (count === 0) return []
  const weights = Array.from({ length: count }, (_, i) => 1 / (i + 1))
  const sum = weights.reduce((a, b) => a + b, 0)
  const counts = weights.map((weight) => Math.max(1, Math.floor((weight / sum) * total)))
  counts[0] += total - counts.reduce((a, b) => a + b, 0)
  return counts
}

/** the note grid floats on the page background with its own shadow, so every demo sits in a dotted box. */
export function NoteGridPage() {
  const [total, setTotal] = useState(50)
  const [sets, setSets] = useState(3)
  const grid = useMemo(() => makeFakeSets(splitCounts(total, sets)), [total, sets])

  return (
    <>
      <PageHeading
        title="note grid"
        description="a grid of notes, each a square coloured by its set. the grid fills its container and always floats on the page with its own shadow. the bar across its top shows the totals, or the hovered note and its set, and holds the toggle between not grouped (every note the same size, in the order of their ids) and grouped (the sets as outlined shapes, the squares of the smaller sets bigger). it starts not grouped."
      />
      <DemoGroup title="size">
        <div className="flex flex-wrap items-center gap-3">
          {presets.map((preset) => (
            <Button
              key={preset}
              size="sm"
              variant={preset === total ? 'default' : 'outline'}
              onClick={() => setTotal(preset)}
            >
              {preset}
            </Button>
          ))}
          <label className="flex items-center gap-2 text-sm">
            notes
            <input
              type="range"
              min={1}
              max={MAX_COUNT}
              value={total}
              onChange={(event) => setTotal(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm">sets</span>
          {setCounts.map((preset) => (
            <Button
              key={preset}
              size="sm"
              variant={preset === sets ? 'default' : 'outline'}
              aria-label={`${preset} ${preset === 1 ? 'set' : 'sets'}`}
              onClick={() => setSets(preset)}
            >
              {preset}
            </Button>
          ))}
          <span className="text-xs text-muted-foreground">
            above 8 sets all squares are the same size when grouped
          </span>
        </div>
        <DemoBox>
          <div style={{ height: 360 }}>
            <NoteGrid sets={grid} label="notes" />
          </div>
        </DemoBox>
      </DemoGroup>
      <DemoGroup title="uneven sets">
        <p className="text-sm text-muted-foreground">
          the sets of a real sync are far apart in size. grouped, the small sets get the bigger
          squares: two notes next to thousands.
        </p>
        <DemoBox className="space-y-8">
          {unevens.map(({ label, counts }) => (
            <div key={label} className="h-80">
              <NoteGrid sets={makeFakeSets(counts)} label={label} />
            </div>
          ))}
        </DemoBox>
      </DemoGroup>
      <DemoGroup title="states">
        <DemoBox className="flex flex-wrap items-start gap-x-8 gap-y-8">
          {states.map(({ label, total: stateTotal, sets: stateSets }) => (
            <div key={label} className="h-52 w-52 shrink-0">
              <NoteGrid sets={makeFakeSets(splitCounts(stateTotal, stateSets))} label={label} />
            </div>
          ))}
        </DemoBox>
      </DemoGroup>
    </>
  )
}
