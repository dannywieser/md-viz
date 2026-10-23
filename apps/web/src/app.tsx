import { AppHeader } from '@md-viz/ui'
import { CacheNoteGrid } from './cache-note-grid'

export function App() {
  return (
    <div className="flex h-screen flex-col">
      <AppHeader title="md-viz" />
      <main className="min-h-0 flex-1 p-6">
        <CacheNoteGrid />
      </main>
    </div>
  )
}
