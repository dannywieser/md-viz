import { useParams } from 'react-router'
import { ExplorationNotFound } from './exploration-not-found'
import { ExplorationPage } from './exploration-page'
import { findExploration } from './registry'

/** `/explorations/:slug`: the exploration, or the not-found card. */
export function ExplorationRoute() {
  const { slug = '' } = useParams()
  const exploration = findExploration(slug)
  return exploration ? <ExplorationPage exploration={exploration} /> : <ExplorationNotFound />
}
