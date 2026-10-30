import { useMemo, useState, type PointerEvent } from 'react'
import { ownerOutline } from './flow-layout'
import { BAR_PX, HoverBar } from './hover-bar'
import { LatticeStage } from './lattice-stage'
import { colorVar } from './note-colors'
import type { SizedSet } from './sized-grid'
import type { TileFit } from './tile-layout'

type TileGridProps = {
  /** in the order the fit was made for. */
  sets: SizedSet[]
  fit: TileFit
}

/**
 * the flowing container of iteration 6 with squares of different sizes: a set's squares are a
 * power of two times the smallest square (see `tileLayout`), the outline runs along the edges
 * between sets. one pointer handler derives the hovered note from the layout.
 */
export function TileGrid({ sets, fit }: TileGridProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const { unit, columns, rows, tiles, owner, tileAt } = fit
  const w = columns * unit
  const h = rows * unit

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const column = Math.floor((event.clientX - box.left) / unit)
    const row = Math.floor((event.clientY - box.top) / unit)
    const inside = column >= 0 && column < columns && row >= 0 && row < rows
    const tile = inside ? tileAt[row * columns + column] : -1
    setHovered(tile === -1 ? null : tile)
  }

  const outline = useMemo(
    () => ownerOutline(owner, columns, rows, unit),
    [owner, columns, rows, unit],
  )
  const total = sets.reduce((sum, set) => sum + set.count, 0)
  const tile = hovered === null ? null : tiles[hovered]
  return (
    <LatticeStage cell={unit} width={w} height={h + BAR_PX}>
      <div className="shadow-hard" style={{ width: w }}>
        <HoverBar
          width={w}
          idle={`${sets.length} sets, ${total} notes`}
          hovered={tile && { ...sets[tile.set], note: tile.note }}
        />
        <svg
          role="img"
          aria-label={`${sets.length} sets in a grid of ${columns} by ${rows} units`}
          width={w}
          height={h}
          shapeRendering="crispEdges"
          className="block overflow-visible bg-card"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHovered(null)}
        >
          {tiles.map((t, index) => (
            <rect
              key={index}
              className={index === 0 ? 'note-square' : undefined}
              x={t.x * unit}
              y={t.y * unit}
              width={t.size * unit}
              height={t.size * unit}
              style={{ fill: colorVar(sets[t.set].color), stroke: 'var(--note-stroke)' }}
            />
          ))}
          <path d={outline} fill="none" stroke="var(--focus)" strokeWidth={2} />
          {tile && (
            <rect
              className="note-hover"
              x={tile.x * unit}
              y={tile.y * unit}
              width={tile.size * unit}
              height={tile.size * unit}
            />
          )}
        </svg>
      </div>
    </LatticeStage>
  )
}
