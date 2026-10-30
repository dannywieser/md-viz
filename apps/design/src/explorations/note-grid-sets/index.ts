import { lazy } from 'react'
import type { Exploration } from '../types'

export const noteGridSets: Exploration = {
  slug: 'note-grid-sets',
  title: 'note grid sets',
  description:
    'one grid with switchable modes: sets as sized blocks on the dot lattice, as groups of squares, and colour by set or tag, with label options.',
  Page: lazy(() =>
    import('./note-grid-sets-page').then((module) => ({ default: module.NoteGridSets })),
  ),
}
