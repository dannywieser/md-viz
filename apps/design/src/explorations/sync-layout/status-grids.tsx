import { NoteGrid } from '@md-viz/ui'
import type { FakeGroups } from './fake-sync'

/** the three status grids side by side; they fill the height of the space they are in. */
export function StatusGrids({ groups }: { groups: FakeGroups }) {
  return (
    <div className="flex min-h-0 flex-1 gap-8 px-4 pb-4">
      {(['updated', 'deleted', 'unchanged'] as const).map((group) => (
        <section key={group} aria-label={group} className="min-w-0 flex-1">
          <NoteGrid notes={groups[group]} label={group} align="start" compactEmpty />
        </section>
      ))}
    </div>
  )
}
