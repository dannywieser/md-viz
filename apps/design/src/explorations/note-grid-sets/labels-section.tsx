import { useState } from 'react'
import { LegendStrip, type LegendItem } from './legend-strip'
import { ModeSwitch } from './mode-switch'
import { SAMPLE_SETS, setCount } from './sample-sets'
import { SizedGrid } from './sized-grid'
import type { LabelMode } from './label-fit'

type StageSize = 'small' | 'large'

const SIZES: { value: StageSize; label: string }[] = [
  { value: 'small', label: 'small' },
  { value: 'large', label: 'large' },
]

/** the drawing area for each size: bigger squares have room for their labels. */
const STAGE: Record<StageSize, { width: number; height: number }> = {
  small: { width: 360, height: 200 },
  large: { width: 560, height: 340 },
}

const sets = SAMPLE_SETS.map((set) => ({ ...set, count: setCount(set.id) }))

const legend: LegendItem[] = sets.map((set) => ({
  key: set.id,
  label: set.name,
  count: set.count,
  color: set.color,
}))

const TREATMENTS: { mode: LabelMode; title: string; text: string }[] = [
  {
    mode: 'inside',
    title: 'chip inside the block',
    text: 'every block gets its name and count in a chip inset in its corner, cut to the block width. small blocks show a fragment or nothing.',
  },
  {
    mode: 'tab',
    title: 'tab on the top edge',
    text: 'the chip hangs flush on the top-left corner with a border, like a file tab, so it reads as part of the block edge. also cut to the width.',
  },
  {
    mode: 'threshold',
    title: 'always visible once it fits',
    text: 'the label is shown whole where the block is big enough and not at all where it is not; the smaller blocks keep their hover tooltip.',
  },
]

/** the label treatments without the header card, at two grid sizes. */
export function LabelsSection() {
  const [size, setSize] = useState<StageSize>('large')
  const { width, height } = STAGE[size]
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">labels without the header card</h3>
      <p className="text-sm text-muted-foreground">
        no card above the grid: the labels live in or on the blocks, or in a legend beside the
        grid. the bigger the squares get, the more of them can show their label all the time, so
        switch the size to see which blocks cross the threshold. every block still has the hover
        tooltip.
      </p>
      <ModeSwitch label="grid size" options={SIZES} value={size} onChange={setSize} />
      <div className="flex flex-wrap gap-8">
        {TREATMENTS.map((treatment) => (
          <div key={treatment.mode} className="space-y-2">
            <h4 className="font-bold">{treatment.title}</h4>
            <p className="max-w-[360px] text-xs text-muted-foreground">{treatment.text}</p>
            <SizedGrid sets={sets} rule="rectangle" labels={treatment.mode} width={width} height={height} />
          </div>
        ))}
        <div className="space-y-2">
          <h4 className="font-bold">legend beside the grid</h4>
          <p className="max-w-[360px] text-xs text-muted-foreground">
            the grid carries no text at all, a legend lists the sets with their counts and
            colours. it works at any size, but the eye has to travel between the two.
          </p>
          <div className="flex gap-6">
            <SizedGrid sets={sets} rule="rectangle" labels="none" width={width} height={height} />
            <LegendStrip items={legend} vertical />
          </div>
        </div>
      </div>
    </section>
  )
}
