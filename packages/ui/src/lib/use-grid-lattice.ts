import { useRef, useState } from 'react'
import { useDotLattice } from './use-dot-lattice'

/**
 * everything a page needs to line its dots up with a note grid: give `ref` and `onCellChange`
 * to the reference `NoteGrid`. `cell` is its reported cell, null until it reports one or while
 * `enabled` is false (say, for a grid with no notes).
 */
export function useGridLattice(enabled = true) {
  const ref = useRef<HTMLDivElement>(null)
  const [reported, setReported] = useState<number | null>(null)
  const cell = enabled ? reported : null
  useDotLattice(ref, cell)
  return { ref, cell, onCellChange: setReported }
}
