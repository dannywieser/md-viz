import { lazy } from 'react'
import type { Exploration } from '../types'

export const notePalettes: Exploration = {
  slug: 'note-palettes',
  title: 'note palettes',
  description:
    'themes for the whole ui with 25 note colors each, and striped note squares at the cell sizes the apps use.',
  Page: lazy(() =>
    import('./note-palettes-page').then((module) => ({ default: module.NotePalettes })),
  ),
}
