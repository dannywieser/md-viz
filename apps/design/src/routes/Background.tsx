import { useState } from 'react'
import { Button, latticeSpacing } from '@md-viz/ui'
import { modes, variants, type Mode, type Variant } from './background-variants'

type Layout = 'single' | 'several'

const SQUARE_TONES = ['#cb4b16', '#b58900', '#859900', '#2aa198', '#268bd2', '#93a1a1']

function NoteBlock({
  mode,
  cell,
  columns,
  rows,
}: {
  mode: Mode
  cell: number
  columns: number
  rows: number
}) {
  const { card, dot } = modes[mode]
  return (
    <div
      className="grid shrink-0"
      style={{ gridTemplateColumns: `repeat(${columns}, ${cell}px)` }}
      aria-hidden="true"
    >
      {Array.from({ length: columns * rows }, (_, i) => (
        <div
          key={i}
          style={{
            width: cell,
            height: cell,
            background: `color-mix(in srgb, ${SQUARE_TONES[(i * 7 + (i >> 2)) % SQUARE_TONES.length]} 55%, ${dot})`,
            outline: `1px solid color-mix(in srgb, ${dot} 60%, ${card})`,
            outlineOffset: -1,
          }}
        />
      ))}
    </div>
  )
}

function MockCard({
  mode,
  cell,
  columns,
  rows,
  aligned,
}: {
  mode: Mode
  cell: number
  columns: number
  rows: number
  /** no padding, so the squares start on the card's corner and stay on the dot lattice. */
  aligned: boolean
}) {
  const { card, text, dot } = modes[mode]
  return (
    <div
      className={aligned ? 'shadow-hard' : 'shadow-hard p-3'}
      style={{ background: card, outline: `1px solid ${dot}`, color: text }}
    >
      <NoteBlock mode={mode} cell={cell} columns={columns} rows={rows} />
    </div>
  )
}

function Swatch({
  variant,
  mode,
  layout,
  cell,
  strength,
}: {
  variant: Variant
  mode: Mode
  layout: Layout
  cell: number
  strength: number
}) {
  const { background, text } = modes[mode]
  const aligned = variant.id === 'dots-scaled'
  // aligned cards sit on the lattice: padding and gaps are whole multiples of the dot spacing.
  const unit = aligned ? latticeSpacing(cell) * Math.ceil(24 / latticeSpacing(cell)) : 24
  const style = {
    background,
    color: text,
    padding: unit,
    gap: unit,
    ...variant.style({ mode, cell, strength }),
  }
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{mode}</p>
      <div
        data-testid={`swatch-${variant.id}-${mode}`}
        className="flex min-h-64 flex-wrap items-start overflow-hidden border"
        style={style}
      >
        {layout === 'single' ? (
          <MockCard mode={mode} cell={cell} columns={14} rows={8} aligned={aligned} />
        ) : (
          <>
            <MockCard mode={mode} cell={cell} columns={16} rows={10} aligned={aligned} />
            <MockCard mode={mode} cell={cell * 2} columns={6} rows={4} aligned={aligned} />
            <MockCard mode={mode} cell={cell * 3} columns={3} rows={2} aligned={aligned} />
          </>
        )}
      </div>
    </div>
  )
}

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
              <Swatch
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
