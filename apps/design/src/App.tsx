import { AppHeader, Button, buttonVariants } from '@md-viz/ui'
import { Board } from './Board'
import { Background } from './routes/Background'
import { useTheme } from './theme'

export function App() {
  const { theme, toggle } = useTheme()
  const onBackground = window.location.pathname === '/background'

  return (
    <div className="min-h-screen">
      <AppHeader title="md-viz design" subtitle={onBackground ? 'background' : 'design'}>
        <a
          href={onBackground ? '/' : '/background'}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          {onBackground ? 'board' : 'background'}
        </a>
        <Button variant="outline" size="sm" onClick={toggle}>
          {theme === 'dark' ? 'switch to light' : 'switch to dark'}
        </Button>
      </AppHeader>
      {onBackground ? <Background /> : <Board />}
    </div>
  )
}
