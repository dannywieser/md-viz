import { background } from './background'
import { states } from './states'
import { syncLayout } from './sync-layout'
import type { Exploration } from './types'

/** every exploration, in the order the index shows them. add a new one here. */
export const explorations: Exploration[] = [background, states, syncLayout]

export const findExploration = (slug: string) =>
  explorations.find((exploration) => exploration.slug === slug)
