import { useState } from 'react'
import { ContainerGrid } from './container-grid'
import { CONTAINER_SIZES, CONTAINERS, type Container } from './container-sizes'
import { ModeSwitch } from './mode-switch'
import { SAMPLE_SETS, setCount } from './sample-sets'
import { fitContainer } from './slot-sets'

const sets = SAMPLE_SETS.map((set) => ({ ...set, count: setCount(set.id) })).sort(
  (a, b) => b.count - a.count,
)

/** the sets slotted into a container of white squares, with the shape each set ended up with. */
export function SlottingSection() {
  const [container, setContainer] = useState<Container>('wide')
  const [outlined, setOutlined] = useState('colour')
  const { width, height } = CONTAINER_SIZES[container]
  const fit = fitContainer(
    sets.map((set) => set.count),
    width,
    height,
  )
  const total = sets.reduce((sum, set) => sum + set.count, 0)
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">slotting sets into a container of white squares</h3>
      <p className="text-sm text-muted-foreground">
        the grid is a container (a card block) of empty white squares, and each set is a group of
        notes in its colour. sets are slotted in biggest first, each as square as the free space
        allows and at the first free spot; a short last row leaves room that a smaller set can take.
        the cell is the largest whole-px size at which every set slots in, so the container is
        exactly its squares and the dots stay on the corners. change the container to see the sets
        re-slot.
      </p>
      <div className="flex flex-wrap gap-6">
        <ModeSwitch
          label="container"
          options={CONTAINERS}
          value={container}
          onChange={setContainer}
        />
        <ModeSwitch
          label="groups"
          options={[
            { value: 'colour', label: 'colour only' },
            { value: 'outline', label: 'with outline' },
          ]}
          value={outlined}
          onChange={setOutlined}
        />
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <ContainerGrid
          sets={sets}
          outlined={outlined === 'outline'}
          width={width}
          height={height}
        />
        <ul className="text-xs text-muted-foreground">
          {sets.map((set, i) => (
            <li key={set.id}>
              {set.name}: {set.count} notes, {fit.slots[i].columns} x {fit.slots[i].rows}
            </li>
          ))}
          <li>
            {fit.columns} x {fit.rows} squares of {fit.cell}px, {fit.columns * fit.rows - total}{' '}
            empty
          </li>
        </ul>
      </div>
    </section>
  )
}
