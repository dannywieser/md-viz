import { useMemo, useState } from 'react'
import { CONTAINER_SIZES, CONTAINERS, type Container } from './container-sizes'
import { groupStates } from './group-states'
import { ModeSwitch } from './mode-switch'
import { scaleSets } from './scale-sets'
import { StateGrid } from './state-grid'

const TOTALS = [
  { value: '100', label: '100' },
  { value: '500', label: '500' },
  { value: '5000', label: '5000' },
]

/** moving between the grouped grid (iteration 7, even share) and the notes in their natural order. */
export function StateSection() {
  const [container, setContainer] = useState<Container>('wide')
  const [total, setTotal] = useState('100')
  const [grouped, setGrouped] = useState(true)
  const { width, height } = CONTAINER_SIZES[container]
  const sets = useMemo(() => scaleSets(Number(total)), [total])
  const states = useMemo(
    () =>
      groupStates(
        sets.map((set) => set.count),
        width,
        height,
      ),
    [sets, width, height],
  )
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">switching between grouped and not grouped</h3>
      <p className="text-sm text-muted-foreground">
        the grid of iteration 7 with the even share, which is the one we are keeping, and a toggle
        in its header bar (the icon button at the right). not grouped, the notes are in their
        natural order, all squares the same size, coloured by set, so the sets are mixed; grouped is
        the flowing shapes with the bigger squares for the smaller sets. each note is one square
        that keeps its identity, so the switch moves and resizes every square from its place in one
        state to its place in the other, and the outline fades in once they have arrived. hovering a
        square names its set and its note (its position in the whole list when not grouped, in its
        set when grouped).
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
      <StateGrid
        sets={sets}
        states={states}
        grouped={grouped}
        onToggle={() => setGrouped((value) => !value)}
      />
    </section>
  )
}
