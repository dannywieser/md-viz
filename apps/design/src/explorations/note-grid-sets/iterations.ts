import type { ComponentType } from 'react'
import { Iteration1 } from './iteration-1'

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
    number: 1,
    title: 'sized blocks, groups, colour modes and labels',
    date: '2026.10.29',
    Component: Iteration1,
  },
]
