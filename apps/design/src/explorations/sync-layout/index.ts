import { lazy } from 'react'
import type { Exploration } from '../types'

export const syncLayout: Exploration = {
  slug: 'sync-layout',
  title: 'sync layout',
  description:
    'the sync app in a fixed window: a one-line status card, grids that fill the height, and where the loader and the note being synced show.',
  Page: lazy(() => import('./sync-layout').then((module) => ({ default: module.SyncLayout }))),
}
