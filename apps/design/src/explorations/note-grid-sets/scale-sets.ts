import { SAMPLE_SETS, setCount } from './sample-sets'
import type { SizedSet } from './sized-grid'

/**
 * the sample sets with their sizes scaled so that together they hold `total` notes: each set keeps
 * its share of the sample (at least one note), and the biggest set takes what rounding leaves over.
 */
export function scaleSets(total: number): SizedSet[] {
  const sample = SAMPLE_SETS.map((set) => setCount(set.id))
  const sampleTotal = sample.reduce((sum, count) => sum + count, 0)
  const counts = sample.map((count) => Math.max(1, Math.round((count * total) / sampleTotal)))
  counts[0] += total - counts.reduce((sum, count) => sum + count, 0)
  return SAMPLE_SETS.map((set, i) => ({ ...set, count: counts[i] }))
}
