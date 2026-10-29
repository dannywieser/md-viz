import { ColourSection } from './colour-section'
import { GroupingSection } from './grouping-section'
import { LabelsSection } from './labels-section'
import { SizingSection } from './sizing-section'

/** iteration 1: sized blocks, grouped squares, the colour modes and the labels. */
export function Iteration1() {
  return (
    <>
      <SizingSection />
      <GroupingSection />
      <ColourSection />
      <LabelsSection />
    </>
  )
}
