import { useRef, type ReactNode } from 'react'
import { useDotLattice } from '@md-viz/ui'

type LatticeStageProps = {
  /** the cell of the grid inside, px: the dots follow it. */
  cell: number
  width: number
  height: number
  children: ReactNode
}

/** a dotted box (the page's dot background) whose dots land on the corners of the squares of the grid inside. */
export function LatticeStage({ cell, width, height, children }: LatticeStageProps) {
  const stage = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  useDotLattice(grid, cell, stage)
  return (
    <div ref={stage} className="bg-dots w-fit border p-4">
      <div ref={grid} className="relative" style={{ width, height }}>
        {children}
      </div>
    </div>
  )
}
