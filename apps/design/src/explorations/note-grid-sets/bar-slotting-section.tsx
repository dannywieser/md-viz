import { useMemo, useState } from 'react'
import { ContainerGrid } from './container-grid'
import { CONTAINER_SIZES, CONTAINERS, type Container } from './container-sizes'
import { ModeSwitch } from './mode-switch'
import { scaleSets } from './scale-sets'

const TOTALS = [
  { value: '100', label: '100' },
  { value: '500', label: '500' },
  { value: '5000', label: '5000' },
]

/** the outlined container with a white bar flush across its top that names the hovered set and note. */
export function BarSlottingSection() {
  const [container, setContainer] = useState<Container>('wide')
  const [total, setTotal] = useState('100')
  const sets = useMemo(() => scaleSets(Number(total)), [total])
  const { width, height } = CONTAINER_SIZES[container]
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">outlined groups with a hover bar</h3>
      <p className="text-sm text-muted-foreground">
        the outlined container of iteration 3 without names on the groups and without a tooltip. a
        white bar sits flush on top of the grid (same width, no gap, one shared shadow). it shows
        the totals while nothing is hovered and, on hover, the set (with its colour) and the note.
        the notes switch scales the same sets (each keeps its share) to 100, 500 or 5000 notes in
        the same space, so the squares shrink. nothing is drawn over the squares and the hover
        outline stays the only mark on the grid.
      </p>
      <div className="flex flex-wrap gap-6">
        <ModeSwitch
          label="container"
          options={CONTAINERS}
          value={container}
          onChange={setContainer}
        />
        <ModeSwitch label="notes" options={TOTALS} value={total} onChange={setTotal} />
      </div>
      <ContainerGrid sets={sets} outlined bar width={width} height={height} />
    </section>
  )
}
