import { lazy } from 'react'
import type { Exploration } from '../types'

export const states: Exploration = {
  slug: 'states',
  title: 'states',
  description:
    'loading, empty and error states in pixel art: a filling well, and icons with whimsical text.',
  Page: lazy(() => import('./states').then((module) => ({ default: module.States }))),
}
