import { useState } from 'react'
import { Button } from '@md-viz/ui'
import { details, phases, type Detail, type Phase } from './fake-sync'
import { SyncWindow, type Placement } from './sync-window'
import { TodayWindow } from './today-window'

const PLACEMENTS: { id: Placement; name: string; description: string }[] = [
  {
    id: 'row',
    name: 'a: in the status row',
    description:
      'a small loader and one line sit in the status row, before the count. nothing moves, but a long note title is cut short.',
  },
  {
    id: 'strip',
    name: 'b: a strip under the row',
    description:
      'a card with the loader, the line, a bar and the counts appears under the row while it runs. the grids give up the height and grow back after.',
  },
  {
    id: 'takeover',
    name: 'c: in place of the grids',
    description:
      'the grids are replaced by a large loader, the line and a bar. the clearest while it runs, but the previous result is hidden until it ends.',
  },
]

export function SyncLayout() {
  const [phase, setPhase] = useState<Phase>('syncing')
  const [detail, setDetail] = useState<Detail>('note')
  const [percent, setPercent] = useState(40)

  const picker = <T extends string>(options: T[], value: T, set: (next: T) => void) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option}
          size="sm"
          variant={option === value ? 'default' : 'outline'}
          onClick={() => set(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  )

  return (
    // a plain page: the dots would hide where the cards of the mock windows end.
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl space-y-10 p-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">sync layout</h1>
          <p className="text-sm text-muted-foreground">
            the sync app in a fixed window: the status card is one line, the three grids fit the
            width and take the height that was wasted, and progress shows the loader and, where the
            sync reports it, the note being pushed. the page has no dot grid here so the cards are
            easy to see; the real app keeps its dots lined up with the squares.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">state</h2>
          {picker(phases, phase, setPhase)}
          <p className="text-sm text-muted-foreground">
            what the line says while syncing: the note being pushed (needs per-note progress from
            the pipeline), or the batch of notes, which is all it reports today.
          </p>
          {picker(details, detail, setDetail)}
          <label className="flex items-center gap-3 text-sm">
            how far along
            <input
              type="range"
              min={0}
              max={100}
              value={percent}
              onChange={(event) => setPercent(Number(event.target.value))}
              aria-label="how far along"
            />
            <span>{percent}%</span>
          </label>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">today</h2>
          <p className="text-sm text-muted-foreground">
            the current window, for comparison: empty space on the right and at the bottom, a tall
            card, grids 160px high.
          </p>
          <TodayWindow phase={phase} percent={percent} />
        </section>

        {PLACEMENTS.map((placement) => (
          <section key={placement.id} className="space-y-3">
            <h2 className="text-lg font-bold">{placement.name}</h2>
            <p className="text-sm text-muted-foreground">{placement.description}</p>
            <SyncWindow
              caption={placement.name}
              placement={placement.id}
              phase={phase}
              percent={percent}
              detail={detail}
            />
          </section>
        ))}
      </main>
    </div>
  )
}
