import { AppHeader } from '@md-viz/ui'
import { Dashboard } from './components/dashboard'

export function App() {
  return (
    <div className="flex h-screen flex-col">
      <AppHeader title="md-viz" />
      <main className="min-h-0 flex-1 px-4 py-6">
        <Dashboard />
      </main>
    </div>
  )
}
