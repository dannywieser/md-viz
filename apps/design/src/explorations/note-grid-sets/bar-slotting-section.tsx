import { useState } from 'react'
import { ContainerGrid } from './container-grid'
import { CONTAINER_SIZES, CONTAINERS, type Container } from './container-sizes'
import { ModeSwitch } from './mode-switch'
import { SAMPLE_SETS, setCount } from './sample-sets'

const sets = SAMPLE_SETS.map((set) => ({ ...set, count: setCount(set.id) }))

/** the outlined container with a white bar flush across its top that names the hovered set and note. */
export function BarSlottingSection() {
  const [container, setContainer] = useState<Container>('wide')
  const { width, height } = CONTAINER_SIZES[container]
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">outlined groups with a hover bar</h3>
      <p className="text-sm text-muted-foreground">
        the outlined container of iteration 3 without names on the groups and without a tooltip. a
        white bar sits flush on top of the grid (same width, no gap, one shared shadow). it shows
        the totals while nothing is hovered and, on hover, the set (with its colour) and the note,
        so nothing is drawn over the squares and the hover outline stays the only mark on the grid.
      </p>
      <ModeSwitch
        label="container"
        options={CONTAINERS}
        value={container}
        onChange={setContainer}
      />
      <ContainerGrid sets={sets} outlined bar width={width} height={height} />
    </section>
  )
}
