import { AppHeader, Button, buttonVariants } from '@md-viz/ui'
import { Board } from './board'
import { ExplorationNotFound } from './explorations/exploration-not-found'
import { ExplorationPage } from './explorations/exploration-page'
import { ExplorationsIndex } from './explorations/explorations-index'
import { resolveRoute } from './route'
import { useTheme } from './theme'

export function App() {
  const { theme, toggle } = useTheme()
  const route = resolveRoute(window.location.pathname)
  const onBoard = route.page === 'board'
  const subtitle = route.page === 'exploration' ? route.exploration.title : 'explorations'

  return (
    <div className="min-h-screen">
      <AppHeader title="md-viz design" subtitle={onBoard ? 'design' : subtitle}>
        <a
          href={onBoard ? '/explorations' : '/'}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          {onBoard ? 'explorations' : 'board'}
        </a>
        <Button variant="outline" size="sm" onClick={toggle}>
          {theme === 'dark' ? 'switch to light' : 'switch to dark'}
        </Button>
      </AppHeader>
      {route.page === 'board' && <Board />}
      {route.page === 'index' && <ExplorationsIndex />}
      {route.page === 'exploration' && <ExplorationPage exploration={route.exploration} />}
      {route.page === 'missing' && <ExplorationNotFound />}
    </div>
  )
}
