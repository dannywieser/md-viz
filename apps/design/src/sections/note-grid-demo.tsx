import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  NOTE_COLORS,
  NoteGrid,
  type Note,
} from '@md-viz/ui'

const presets = [5, 50, 500, 5000]
const MAX_COUNT = 20000

// the states a grid can be in, each shown at the same width as a status column in the apps.
const states = [
  { label: 'one', count: 1 },
  { label: 'a few', count: 5 },
  { label: 'many', count: 500 },
  { label: 'empty', count: 0 },
]

/** deterministic colours so the board looks the same on every load. */
function makeNotes(count: number): Note[] {
  let seed = 7
  return Array.from({ length: count }, (_, i) => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    // one to three colours, so the board shows the stripes too
    const stripes = 1 + (seed % 3)
    const colors = Array.from(
      { length: stripes },
      (_, j) => ((seed >> (j * 4 + 3)) >>> 0) % (NOTE_COLORS - 1),
    )
    return {
      id: `note-${i}`,
      title: `note ${i + 1}`,
      colors,
      tags: colors.map((color) => `tag ${color}`),
    }
  })
}

/**
 * the note grid is never shown on a card: it floats on the page background with its own shadow.
 * only the heading and the controls sit on cards, and the grids sit below them.
 */
export function NoteGridDemo() {
  const [count, setCount] = useState(50)
  const notes = useMemo(() => makeNotes(count), [count])

  return (
    <section className="space-y-8">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">note grid</h2>
          <CardDescription>
            a grid of notes, each a square. squares shrink as the set grows so every note stays
            visible. the grid always floats on the page with its own shadow, never on a card; an
            empty set shows an empty block, and a label hangs above it as wide as the grid.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap items-center gap-3 px-6">
          {presets.map((preset) => (
            <Button
              key={preset}
              size="sm"
              variant={preset === count ? 'default' : 'outline'}
              onClick={() => setCount(preset)}
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
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
          </label>
        </div>
      </Card>
      <NoteGrid notes={notes} label="notes" height={320} />
      <div className="flex flex-wrap items-start gap-x-8 gap-y-8">
        {states.map(({ label, count: stateCount }) => (
          <div key={label} className="w-52 shrink-0">
            <NoteGrid notes={makeNotes(stateCount)} label={label} height={160} align="start" />
          </div>
        ))}
      </div>
    </section>
  )
}
