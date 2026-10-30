import { useMemo, useState, type PointerEvent } from 'react'
import { groupOutline } from './block-shapes'
import { BAR_PX, HoverBar } from './hover-bar'
import { LatticeStage } from './lattice-stage'
import { colorVar } from './note-colors'
import type { ScaledFit } from './scaled-slots'
import type { SizedSet } from './sized-grid'

type ScaledGridProps = {
  /** biggest first, in the order the fit was made for. */
  sets: SizedSet[]
  fit: ScaledFit
}

/**
 * the outlined container with a hover bar, where each set's squares are a whole multiple of the
 * smallest square (see `scaleLayout`). the empty units are one set of gridlines; one pointer
 * handler derives the hovered note from the layout.
 */
export function ScaledGrid({ sets, fit }: ScaledGridProps) {
  const [hovered, setHovered] = useState<{ set: number; note: number } | null>(null)
  const { unit, columns, rows, slots, owner } = fit
  const w = columns * unit
  const h = rows * unit

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const column = Math.floor((event.clientX - box.left) / unit)
    const row = Math.floor((event.clientY - box.top) / unit)
    const set =
      column >= 0 && column < columns && row >= 0 && row < rows ? owner[row * columns + column] : -1
    if (set === -1) return setHovered(null)
    const slot = slots[set]
    const note =
      Math.floor((row - slot.y) / slot.scale) * slot.columns +
      Math.floor((column - slot.x) / slot.scale)
    setHovered({ set, note })
  }

  const lines = useMemo(() => {
    const vertical = Array.from({ length: columns + 1 }, (_, i) => `M${i * unit},0V${h}`)
    const horizontal = Array.from({ length: rows + 1 }, (_, i) => `M0,${i * unit}H${w}`)
    return [...vertical, ...horizontal].join('')
  }, [unit, columns, rows, w, h])

  const slot = hovered && slots[hovered.set]
  const total = sets.reduce((sum, set) => sum + set.count, 0)
  return (
    <LatticeStage cell={unit} width={w} height={h + BAR_PX}>
      <div className="shadow-hard" style={{ width: w }}>
        <HoverBar
          width={w}
          idle={`${sets.length} sets, ${total} notes`}
          hovered={hovered && { ...sets[hovered.set], note: hovered.note }}
        />
        <svg
          role="img"
          aria-label={`${sets.length} sets in a container of ${columns} by ${rows} units`}
          width={w}
          height={h}
          shapeRendering="crispEdges"
          className="block overflow-visible bg-card"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHovered(null)}
        >
          <path d={lines} fill="none" style={{ stroke: 'var(--note-stroke)' }} />
          {sets.map((set, i) => {
            const { x, y, columns: perRow, scale } = slots[i]
            const side = scale * unit
            return (
              <g key={set.id} transform={`translate(${x * unit} ${y * unit})`}>
                {Array.from({ length: set.count }, (_, k) => (
                  <rect
                    key={k}
                    className={i === 0 && k === 0 ? 'note-square' : undefined}
                    x={(k % perRow) * side}
                    y={Math.floor(k / perRow) * side}
                    width={side}
                    height={side}
                    style={{ fill: colorVar(set.color), stroke: 'var(--note-stroke)' }}
                  />
                ))}
                <path
                  d={groupOutline(set.count, perRow, side)}
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth={2}
                />
              </g>
            )
          })}
          {hovered && slot && (
            <rect
              className="note-hover"
              x={(slot.x + (hovered.note % slot.columns) * slot.scale) * unit}
              y={(slot.y + Math.floor(hovered.note / slot.columns) * slot.scale) * unit}
              width={slot.scale * unit}
              height={slot.scale * unit}
            />
          )}
        </svg>
      </div>
    </LatticeStage>
  )
}
