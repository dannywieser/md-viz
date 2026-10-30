import { colorVar } from './note-colors'

export type LegendItem = { key: string; label: string; count?: number; color: number }

type LegendStripProps = {
  items: LegendItem[]
  /** lay the items out in a column (beside the grid) instead of a row (below it). */
  vertical?: boolean
}

/** a legend for a grid with no labels of its own: a swatch, the name and the count of each item. */
export function LegendStrip({ items, vertical = false }: LegendStripProps) {
  return (
    <ul
      className={
        vertical ? 'flex flex-col gap-1 text-xs' : 'flex flex-wrap gap-x-4 gap-y-1 text-xs'
      }
    >
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block size-3 border"
            style={{ backgroundColor: colorVar(item.color) }}
          />
          {item.label}
          {item.count !== undefined && <span className="text-muted-foreground">{item.count}</span>}
        </li>
      ))}
    </ul>
  )
}
