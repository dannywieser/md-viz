import { useLayoutEffect, type RefObject } from 'react'
import { latticeSpacing } from './note-grid-layout'

/**
 * Lines the page's dots up with the first note square of the grid inside `ref`: the dot spacing
 * follows the grid's cell and a dot sits on every square corner. Sets the page's `--grid-*` vars.
 */
export function useDotLattice(ref: RefObject<HTMLElement | null>, cell: number | null) {
  useLayoutEffect(() => {
    const card = ref.current
    if (!card || cell === null) return
    const root = document.documentElement
    const apply = () => {
      const square = card.querySelector('.note-square')
      if (!square) return
      const box = square.getBoundingClientRect()
      root.style.setProperty('--grid-size', `${latticeSpacing(cell)}px`)
      root.style.setProperty('--grid-origin-x', `${box.left}px`)
      root.style.setProperty('--grid-origin-y', `${box.top}px`)
    }
    apply()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(apply)
    observer?.observe(card)
    observer?.observe(root)
    return () => {
      observer?.disconnect()
      for (const name of ['--grid-size', '--grid-origin-x', '--grid-origin-y']) {
        root.style.removeProperty(name)
      }
    }
  }, [ref, cell])
}
