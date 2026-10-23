import { latticeSpacing } from '@md-viz/ui'
import { modes, type Layout, type Mode, type Variant } from './background-variants'
import { MockCard } from './mock-card'

export function BackgroundSwatch({
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
