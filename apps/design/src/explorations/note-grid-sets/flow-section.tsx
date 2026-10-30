import { useMemo, useState } from 'react'
import { CONTAINER_SIZES, CONTAINERS, type Container } from './container-sizes'
import { FlowGrid } from './flow-grid'
import { flowLayout } from './flow-layout'
import { ModeSwitch } from './mode-switch'
import { scaleSets } from './scale-sets'

const TOTALS = [
  { value: '100', label: '100' },
  { value: '500', label: '500' },
  { value: '5000', label: '5000' },
]

const DIRECTIONS = [
  { value: 'columns', label: 'down columns' },
  { value: 'rows', label: 'along rows' },
]

/** the share by notes, every square the same size, sets as flowing shapes so no space is left over. */
export function FlowSection() {
  const [container, setContainer] = useState<Container>('wide')
  const [total, setTotal] = useState('100')
  const [direction, setDirection] = useState('columns')
  const { width, height } = CONTAINER_SIZES[container]
  const sets = useMemo(() => scaleSets(Number(total)), [total])
  const fit = useMemo(
    () =>
      flowLayout(
        sets.map((set) => set.count),
        width,
        height,
        direction === 'rows',
      ),
    [sets, width, height, direction],
  )
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">every set by its notes, shapes that fill all the space</h3>
      <p className="text-sm text-muted-foreground">
        each set gets space in proportion to its notes, so every square is the same size, and the
        sets do not have to be square: the notes are laid along a snake path through the grid (down
        one column, up the next, or along the rows), set after set. every cell is a note, so there
        are no filler squares and nothing is left empty, and since the path never jumps, each set is
        one connected shape: a band with a ragged end where the next set begins. the grid is chosen
        so its columns times its rows is exactly the number of notes, with the biggest squares that
        fit the container (so it can be narrower than the box).
      </p>
      <div className="flex flex-wrap gap-6">
        <ModeSwitch
          label="container"
          options={CONTAINERS}
          value={container}
          onChange={setContainer}
        />
        <ModeSwitch label="notes" options={TOTALS} value={total} onChange={setTotal} />
        <ModeSwitch
          label="bands run"
          options={DIRECTIONS}
          value={direction}
          onChange={setDirection}
        />
      </div>
      <FlowGrid sets={sets} fit={fit} />
      <p className="text-xs text-muted-foreground">
        {fit.columns} x {fit.rows} squares of {fit.cell}px
      </p>
    </section>
  )
}
