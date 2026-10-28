import { AppHeader, ThemeSelect, useTheme } from '@md-viz/ui'
import { Dashboard } from './components/dashboard'

export function App() {
  const { theme, themes, setTheme } = useTheme()

  return (
    <div className="flex h-screen flex-col">
      <AppHeader title="md-viz">
        <ThemeSelect value={theme.id} themes={themes} onChange={setTheme} />
      </AppHeader>
      <main className="min-h-0 flex-1 px-4 py-6">
        <Dashboard />
      </main>
    </div>
  )
}
