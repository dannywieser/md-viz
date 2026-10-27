import { NoteGrid } from '@md-viz/ui'
import type { FakeGroups } from './fake-sync'
import { COLUMN_GAP, COLUMN_WIDTH, SMALL_GRID_HEIGHT } from './window-size'

/**
 * drawing height of each grid, or undefined to fill the height of the window. the columns are all
 * as wide as today, but their heights differ: the grid of the few deleted notes keeps its 160px (3
 * squares wide, 2 tall), the grids of many notes take what the window has left.
 */
const HEIGHTS = { updated: undefined, deleted: SMALL_GRID_HEIGHT, unchanged: undefined }

/** the three status grids side by side, in columns of the same width. */
export function StatusGrids({ groups }: { groups: FakeGroups }) {
  return (
    <div className="flex min-h-0 flex-1 px-4 pb-4" style={{ columnGap: COLUMN_GAP }}>
      {(['updated', 'deleted', 'unchanged'] as const).map((group) => (
        <section
          key={group}
          aria-label={group}
          className="shrink-0"
          style={{ width: COLUMN_WIDTH }}
        >
          <NoteGrid
            notes={groups[group]}
            label={group}
            height={HEIGHTS[group]}
            align="start"
            compactEmpty
          />
        </section>
      ))}
    </div>
  )
}
