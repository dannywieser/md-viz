import { useState } from 'react'
import { LegendStrip, type LegendItem } from './legend-strip'
import { ModeSwitch } from './mode-switch'
import type { ColorMode } from './note-colors'
import { SAMPLE_NOTES, SAMPLE_SETS, SAMPLE_TAGS, TAG_COLOR, setCount } from './sample-sets'
import { StripedSetGrid } from './striped-set-grid'

const MODES: { value: ColorMode; label: string }[] = [
  { value: 'set', label: 'by set' },
  { value: 'tag', label: 'by tag' },
]

const SET_LEGEND: LegendItem[] = SAMPLE_SETS.map((set) => ({
  key: set.id,
  label: set.name,
  count: setCount(set.id),
  color: set.color,
}))

const TAG_LEGEND: LegendItem[] = SAMPLE_TAGS.map((tag) => ({
  key: tag,
  label: tag,
  color: TAG_COLOR[tag],
}))

/** one grid of every note with a switch between colouring by set and by tag; a note in several sets or tags is striped. */
export function ColourSection() {
  const [mode, setMode] = useState<ColorMode>('set')
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold">colour modes: by set or by tag</h3>
      <p className="text-sm text-muted-foreground">
        the same grid of every note, switched between two colourings. a square shows up to three
        stripes, one per set (some sample notes are in two or three sets) or per tag; a note
        without tags is the neutral grey. the legend follows the mode. switch the theme in the nav
        to see the colours follow it.
      </p>
      <ModeSwitch label="colour" options={MODES} value={mode} onChange={setMode} />
      <StripedSetGrid notes={SAMPLE_NOTES} mode={mode} width={720} height={300} />
      <LegendStrip items={mode === 'set' ? SET_LEGEND : TAG_LEGEND} />
    </section>
  )
}
