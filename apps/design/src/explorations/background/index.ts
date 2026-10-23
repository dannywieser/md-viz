import { lazy } from 'react'
import type { Exploration } from '../types'

export const background: Exploration = {
  slug: 'background',
  title: 'background',
  description: 'candidates for the page background, each in light and dark behind mock grid cards.',
  Page: lazy(() => import('./background').then((module) => ({ default: module.Background }))),
}
