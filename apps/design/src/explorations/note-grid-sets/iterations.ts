import type { ComponentType } from 'react'
import { Iteration1 } from './iteration-1'
import { Iteration2 } from './iteration-2'

export type Iteration = {
  number: number
  title: string
  /** YYYY.MM.DD */
  date: string
  Component: ComponentType
}

/**
 * every iteration of the exploration, newest first. a new iteration goes on top; the earlier ones
 * stay (nothing is replaced or deleted), so the page shows the whole path.
 */
export const iterations: Iteration[] = [
  {
    number: 2,
    title: 'grouped squares slotted into a container',
    date: '2026.10.29',
    Component: Iteration2,
  },
  {
    number: 1,
    title: 'sized blocks, groups, colour modes and labels',
    date: '2026.10.29',
    Component: Iteration1,
  },
]
