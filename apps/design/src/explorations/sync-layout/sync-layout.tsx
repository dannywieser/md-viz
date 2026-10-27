import { useState } from 'react'
import { Button } from '@md-viz/ui'
import { phases, type Phase } from './fake-sync'
import { SyncWindow, type Placement } from './sync-window'
import { TodayWindow } from './today-window'

const PLACEMENTS: { id: Placement; name: string; description: string }[] = [
  {
    id: 'overlay',
    name: 'c: overlay',
    description:
      'the loader, a line, a bar and the counts sit in a block on a see-through veil over the grids, so the last result shows through while it runs.',
  },
  {
    id: 'takeover',
    name: 'c: solid',
    description:
      'the same block in place of the grids, for comparison: the previous result is hidden until it ends.',
  },
]

export function SyncLayout() {
  const [phase, setPhase] = useState<Phase>('syncing')
  const [percent, setPercent] = useState(40)

  return (
    // a plain page: the dots would hide where the cards of the mock windows end.
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl space-y-10 p-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">sync layout</h1>
          <p className="text-sm text-muted-foreground">
            the sync app in a fixed window: the status card is one line, the three grids keep
            today's column width and the window is just wide enough for them, and the grids of many
            notes take the height that was wasted. the progress shows what the sync reports today
            (notes pushed and deleted of the total, and folders and notes found while scanning); the
            pipeline does not change. the page has no dot grid here so the cards are easy to see;
            the real app keeps its dots lined up with the squares.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">state</h2>
          <div className="flex flex-wrap gap-2">
            {phases.map((option) => (
              <Button
                key={option}
                size="sm"
                variant={option === phase ? 'default' : 'outline'}
                onClick={() => setPhase(option)}
              >
                {option}
              </Button>
            ))}
          </div>
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

        {PLACEMENTS.map((placement) => (
          <section key={placement.id} className="space-y-3">
            <h2 className="text-lg font-bold">{placement.name}</h2>
            <p className="text-sm text-muted-foreground">{placement.description}</p>
            <SyncWindow
              caption={placement.name}
              placement={placement.id}
              phase={phase}
              percent={percent}
            />
          </section>
        ))}

        <section className="space-y-3">
          <h2 className="text-lg font-bold">today</h2>
          <p className="text-sm text-muted-foreground">
            the current window, for comparison: empty space on the right and at the bottom, a tall
            card, grids 160px high.
          </p>
          <TodayWindow phase={phase} percent={percent} />
        </section>
      </main>
    </div>
  )
}
