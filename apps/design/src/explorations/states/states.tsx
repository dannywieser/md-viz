import { useState } from 'react'
import { Button, Card, EmptyState, Loader, loaderFills } from '@md-viz/ui'
import { GridSpot } from './grid-spot'
import { icons, type IconKind } from './icon-options'
import { StateBody } from './state-body'
import { StateFrame } from './state-frame'
import { emptyTexts, errorTexts, retryLabels } from './text-options'

const ACCENTS: Record<IconKind, string> = { empty: 'var(--primary)', error: 'var(--destructive)' }

export function States() {
  const [emptyText, setEmptyText] = useState(0)
  const [errorText, setErrorText] = useState(0)
  const [retry, setRetry] = useState(0)
  const [canRetry, setCanRetry] = useState(true)
  const [loads, setLoads] = useState(0)

  const picker = (options: string[], value: number, set: (index: number) => void) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option, index) => (
        <Button
          key={option}
          size="sm"
          variant={index === value ? 'default' : 'outline'}
          onClick={() => set(index)}
        >
          {option}
        </Button>
      ))}
    </div>
  )

  const body = (kind: IconKind, index: number) => {
    const text = kind === 'empty' ? emptyTexts[emptyText] : errorTexts[errorText]
    const action =
      kind === 'error' && canRetry ? <Button size="sm">{retryLabels[retry]}</Button> : undefined
    return (
      <StateBody
        rows={icons[index].rows}
        accent={ACCENTS[kind]}
        notePalette={icons[index].notePalette}
        text={text}
        action={action}
      />
    )
  }

  return (
    <main className="mx-auto max-w-6xl space-y-10 p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">states</h1>
        <p className="text-sm text-muted-foreground">
          loading, empty and error states in pixel art. each option is shown alone on the dot-grid
          page and in the block where a note grid would float. the loader has no visible text, only
          an aria label.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">loading</h2>
        <p className="text-sm text-muted-foreground">
          a well filling with squares in the note grid palette, then emptying and starting again.
        </p>
        <div className="space-y-2">
          <div>
            <h3 className="font-bold">random</h3>
            <p className="text-sm text-muted-foreground">
              the real thing: each load picks one of the fills below at random and repeats that one
              until it is gone.
            </p>
          </div>
          <Button size="sm" onClick={() => setLoads(loads + 1)}>
            load again
          </Button>
          <div className="grid gap-4 md:grid-cols-2">
            <StateFrame caption="alone">
              <Loader key={`alone-${loads}`} label="loading, random" />
            </StateFrame>
            <StateFrame caption="in the grid block">
              <GridSpot>
                <Loader key={`block-${loads}`} label="loading in block, random" />
              </GridSpot>
            </StateFrame>
          </div>
        </div>
        {loaderFills.map((variant) => (
          <div key={variant.id} className="space-y-2">
            <div>
              <h3 className="font-bold">{variant.name}</h3>
              <p className="text-sm text-muted-foreground">{variant.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <StateFrame caption="alone">
                <Loader fill={variant} label={`loading, ${variant.name}`} />
              </StateFrame>
              <StateFrame caption="in the grid block">
                <GridSpot>
                  <Loader fill={variant} label={`loading in block, ${variant.name}`} />
                </GridSpot>
              </StateFrame>
            </div>
          </div>
        ))}
      </section>

      {(['empty', 'error'] as const).map((kind) => (
        <section key={kind} className="space-y-3">
          <h2 className="text-lg font-bold">{kind}</h2>
          {kind === 'empty' ? (
            picker(emptyTexts, emptyText, setEmptyText)
          ) : (
            <>
              {picker(errorTexts, errorText, setErrorText)}
              {picker(retryLabels, retry, setRetry)}
              <Button
                size="sm"
                variant={canRetry ? 'default' : 'outline'}
                onClick={() => setCanRetry(!canRetry)}
              >
                {canRetry ? 'retry shown' : 'no retry'}
              </Button>
            </>
          )}
          {icons.flatMap((icon, index) =>
            icon.kind === kind
              ? [
                  <div key={icon.id} className="space-y-2">
                    <h3 className="font-bold">{icon.name}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <StateFrame caption="alone">
                        <Card>{body(kind, index)}</Card>
                      </StateFrame>
                      <StateFrame caption="in the grid block">
                        <GridSpot>{body(kind, index)}</GridSpot>
                      </StateFrame>
                    </div>
                  </div>,
                ]
              : [],
          )}
          {kind === 'empty' && (
            <div className="space-y-2">
              <div>
                <h3 className="font-bold">compact</h3>
                <p className="text-sm text-muted-foreground">
                  a small, muted ghost with no text, for blocks that are too small for the full
                  state, like the sync app's status grids (an option on the note grid).
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <StateFrame caption="alone">
                  <Card>
                    <EmptyState compact />
                  </Card>
                </StateFrame>
                <StateFrame caption="in the grid block">
                  <GridSpot>
                    <EmptyState compact />
                  </GridSpot>
                </StateFrame>
              </div>
            </div>
          )}
        </section>
      ))}
    </main>
  )
}
