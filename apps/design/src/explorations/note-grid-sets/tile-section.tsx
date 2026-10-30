import { useMemo, useState } from 'react'
import { CONTAINER_SIZES, CONTAINERS, type Container } from './container-sizes'
import { ModeSwitch } from './mode-switch'
import { scaleSets } from './scale-sets'
import { TileGrid } from './tile-grid'
import { tileLayout } from './tile-layout'

const TOTALS = [
  { value: '100', label: '100' },
  { value: '500', label: '500' },
  { value: '5000', label: '5000' },
]

/** share = notes ^ exponent: 1 is by notes, 0 is the same for every set. */
const SHARES = [
  { value: '0.5', label: 'softened' },
  { value: '0', label: 'even' },
  { value: '1', label: 'by notes' },
]

/** flowing shapes that fill all the space, with bigger squares for the smaller sets. */
export function TileSection() {
  const [container, setContainer] = useState<Container>('wide')
  const [total, setTotal] = useState('100')
  const [share, setShare] = useState('0.5')
  const { width, height } = CONTAINER_SIZES[container]
  const sets = useMemo(() => scaleSets(Number(total)), [total])
  const fit = useMemo(
    () =>
      tileLayout(
        sets.map((set) => set.count),
        Number(share),
        width,
        height,
      ),
    [sets, share, width, height],
  )
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">flowing shapes with squares of different sizes</h3>
      <p className="text-sm text-muted-foreground">
        iteration 6 with the softened share back: the big sets get less space per note, so smaller
        squares, and the small sets more, so bigger ones. so that the grid still has no filler and
        no gaps, the square sizes are powers of two times the smallest square (1, 2, 4, ...), picked
        as close to what the share asks for as an exact fit allows. the sets with the biggest
        squares are placed first and the next set carries on from where the last one stopped (the
        rest of its column, then the columns beside it), so every set is one connected shape and
        every square is a note.
      </p>
      <div className="flex flex-wrap gap-6">
        <ModeSwitch
          label="container"
          options={CONTAINERS}
          value={container}
          onChange={setContainer}
        />
        <ModeSwitch label="notes" options={TOTALS} value={total} onChange={setTotal} />
        <ModeSwitch label="share" options={SHARES} value={share} onChange={setShare} />
      </div>
      <TileGrid sets={sets} fit={fit} />
      <ul className="space-y-1 text-xs text-muted-foreground">
        {sets.map((set, i) => (
          <li key={set.id}>
            {set.name}: {set.count} notes, squares {fit.scales[i]}x the smallest (
            {fit.scales[i] * fit.unit}px)
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        {fit.columns} x {fit.rows} units of {fit.unit}px
      </p>
    </section>
  )
}
