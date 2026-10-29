import { SAMPLE_SETS, setCount } from './sample-sets'
import { blockShape, SIZE_RULES, type SizeRule } from './block-shapes'
import { SizedGrid } from './sized-grid'

const DESCRIPTIONS: Record<SizeRule, string> = {
  round: 'a square with the rounded side of sqrt(n): a little smaller than the count',
  ceil: 'a square with the side of sqrt(n) rounded up: a little bigger than the count',
  rectangle: 'the near-square rectangle that holds at least n cells: the least waste',
}

const sets = SAMPLE_SETS.map((set) => ({ ...set, count: setCount(set.id) }))

/** the three sizing rules on the same sets: each block is a whole number of cells, so its corners are on dots. */
export function SizingSection() {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">sized squares: one block per set</h3>
      <p className="text-sm text-muted-foreground">
        every set is one block as big as its notes, in whole cells, packed largest first at the
        largest cell that fits. the cell is a whole number of px and the dots are drawn from the
        first block's corner, so every block edge is on a dot. the rules differ in how a count that
        is not a square number (50 is not) becomes a shape. hover a block for its numbers.
      </p>
      <div className="flex flex-wrap gap-8">
        {SIZE_RULES.map((rule) => (
          <div key={rule} className="space-y-2">
            <h4 className="font-bold">{rule}</h4>
            <p className="max-w-[560px] text-xs text-muted-foreground">{DESCRIPTIONS[rule]}</p>
            <SizedGrid sets={sets} rule={rule} labels="threshold" width={560} height={300} />
            <ul className="text-xs text-muted-foreground">
              {sets.map((set) => {
                const { columns, rows } = blockShape(set.count, rule)
                return (
                  <li key={set.id}>
                    {set.name}: {set.count} notes, {columns} x {rows} = {columns * rows} cells
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
