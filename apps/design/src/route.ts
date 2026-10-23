import { findExploration } from './explorations/registry'
import type { Exploration } from './explorations/types'

export type Route =
  | { page: 'board' }
  | { page: 'index' }
  | { page: 'exploration'; exploration: Exploration }
  | { page: 'missing' }

const PREFIX = '/explorations'

/** the page for a pathname: the board, the explorations index, one exploration or none. */
export function resolveRoute(pathname: string): Route {
  const path = pathname.replace(/\/+$/, '')
  if (path === PREFIX) return { page: 'index' }
  if (!path.startsWith(`${PREFIX}/`)) return { page: 'board' }
  const exploration = findExploration(decodeURIComponent(path.slice(PREFIX.length + 1)))
  return exploration ? { page: 'exploration', exploration } : { page: 'missing' }
}
