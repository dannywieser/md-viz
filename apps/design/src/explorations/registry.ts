import { background } from './background'
import { states } from './states'
import type { Exploration } from './types'

/** every exploration, in the order the index shows them. add a new one here. */
export const explorations: Exploration[] = [background, states]

export const findExploration = (slug: string) =>
  explorations.find((exploration) => exploration.slug === slug)
