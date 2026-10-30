import { useState } from 'react'
import { ContainerGrid } from './container-grid'
import { CONTAINER_SIZES, CONTAINERS, type Container } from './container-sizes'
import { ModeSwitch } from './mode-switch'
import { SAMPLE_SETS, setCount } from './sample-sets'

const THRESHOLDS = [
  { value: 'off', label: 'off' },
  { value: '60', label: '60px' },
  { value: '100', label: '100px' },
  { value: '140', label: '140px' },
]

const sets = SAMPLE_SETS.map((set) => ({ ...set, count: setCount(set.id) }))

/** the outlined container with each set's name over its group once the group is wide enough. */
export function LabelledSlottingSection() {
  const [container, setContainer] = useState<Container>('wide')
  const [threshold, setThreshold] = useState('100')
  const { width, height } = CONTAINER_SIZES[container]
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">outlined groups with the set name on top</h3>
      <p className="text-sm text-muted-foreground">
        the same container as iteration 2, always outlined. each set's name is text over its group,
        in the top-left corner, with a thin halo of the card colour so it reads on any note colour.
        it ignores the pointer, so hovering a square still outlines that square and names the note.
        a name only shows once its group is at least the threshold wide (and the name fits), so the
        small groups stay clean; the switch moves the threshold.
      </p>
      <div className="flex flex-wrap gap-6">
        <ModeSwitch
          label="container"
          options={CONTAINERS}
          value={container}
          onChange={setContainer}
        />
        <ModeSwitch
          label="names from"
          options={THRESHOLDS}
          value={threshold}
          onChange={setThreshold}
        />
      </div>
      <ContainerGrid
        sets={sets}
        outlined
        labelWidth={threshold === 'off' ? undefined : Number(threshold)}
        width={width}
        height={height}
      />
    </section>
  )
}
