import { useMemo, useState } from 'react'
import { CONTAINER_SIZES, CONTAINERS, type Container } from './container-sizes'
import { ModeSwitch } from './mode-switch'
import { ScaledGrid } from './scaled-grid'
import { scaleLayout } from './scaled-slots'
import { scaleSets } from './scale-sets'

const TOTALS = [
  { value: '100', label: '100' },
  { value: '500', label: '500' },
  { value: '5000', label: '5000' },
]

/** share = notes ^ exponent: 1 is by notes, 0 is the same share for every set. */
const SHARES = [
  { value: '1', label: 'by notes' },
  { value: '0.5', label: 'softened' },
  { value: '0', label: 'even' },
]

/** each set gets a share of the space and its squares grow, in whole multiples of the smallest, to fill it. */
export function ScaledSection() {
  const [container, setContainer] = useState<Container>('wide')
  const [total, setTotal] = useState('100')
  const [share, setShare] = useState('0.5')
  const { width, height } = CONTAINER_SIZES[container]
  const sets = useMemo(() => scaleSets(Number(total)), [total])
  const fit = useMemo(
    () =>
      scaleLayout(
        sets.map((set) => set.count),
        Number(share),
        width,
        height,
      ),
    [sets, share, width, height],
  )
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">
        a share of the space per set, squares that grow to fill it
      </h3>
      <p className="text-sm text-muted-foreground">
        every set is given a percentage of the container, and its squares are made as big as that
        space allows (every set is a full square block, with filler squares for what its notes do
        not fill), in whole multiples of the smallest square (so everything stays on the dot
        lattice): a set of two notes with a big share gets big squares. the share is the set's notes
        to a power: by notes gives every set space in proportion to its notes, so the squares start
        out the same size; softened (square root) and even give the small sets more than their notes
        ask for. a set that does not fit at its size tries a smaller one. once everything is placed
        the free space is used: each set, the smallest first, grows another multiple for as long as
        everything still fits, and a few unit sizes are compared for the most area covered by notes.
        the list shows what each set actually got.
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
      <ScaledGrid sets={sets} fit={fit} />
      <ul className="space-y-1 text-xs text-muted-foreground">
        {sets.map((set, i) => (
          <li key={set.id}>
            {set.name}: {set.count} notes, {Math.round(fit.shares[i] * 100)}% of the space, squares{' '}
            {fit.slots[i].scale}x the smallest ({fit.slots[i].scale * fit.unit}px),{' '}
            {fit.slots[i].columns} x {fit.slots[i].rows} block,{' '}
            {fit.slots[i].columns ** 2 - set.count} filler
          </li>
        ))}
      </ul>
    </section>
  )
}
