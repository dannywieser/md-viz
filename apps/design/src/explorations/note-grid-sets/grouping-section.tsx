import { SAMPLE_SETS, setCount } from './sample-sets'
import { GroupedGrid } from './grouped-grid'

const sets = SAMPLE_SETS.map((set) => ({ ...set, count: setCount(set.id) }))

/** the variant of the sized blocks that keeps every note as its own square, grouped by colour. */
export function GroupingSection() {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">grouped squares: every note, one colour per set</h3>
      <p className="text-sm text-muted-foreground">
        the same packing as the sized blocks, but each note is still its own square and a set is
        only a group of them in one colour, filled row by row in the set's rectangle (the last row
        is short). the first grid has just the colour, the second adds a heavier outline around each
        group. the single note of set g is a one-square group.
      </p>
      <div className="flex flex-wrap gap-8">
        <div className="space-y-2">
          <h4 className="font-bold">colour only</h4>
          <GroupedGrid sets={sets} outlined={false} width={560} height={300} />
        </div>
        <div className="space-y-2">
          <h4 className="font-bold">with outline</h4>
          <GroupedGrid sets={sets} outlined width={560} height={300} />
        </div>
      </div>
    </section>
  )
}
