import { useLayoutEffect, type RefObject } from 'react'
import { latticeSpacing } from '../lib/note-grid-layout'

/**
 * Lines the dots up with the first note square of the grid inside `ref`: the dot spacing follows
 * the grid's cell and a dot sits on every square corner. Sets the `--grid-*` vars on the page, or
 * on `target` (an element with the `bg-dots` background) to line up just that element's dots.
 */
export function useDotLattice(
  ref: RefObject<HTMLElement | null>,
  cell: number | null,
  target?: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const card = ref.current
    if (!card || cell === null) return
    const root = target?.current ?? document.documentElement
    const local = target?.current ?? null
    const apply = () => {
      const square = card.querySelector('.note-square')
      if (!square) return
      const box = square.getBoundingClientRect()
      // the dots start at the padding edge of their own element, the page's at the window corner
      const edge = local?.getBoundingClientRect()
      const left = box.left - (edge ? edge.left + local!.clientLeft : 0)
      const top = box.top - (edge ? edge.top + local!.clientTop : 0)
      root.style.setProperty('--grid-size', `${latticeSpacing(cell)}px`)
      root.style.setProperty('--grid-origin-x', `${left}px`)
      root.style.setProperty('--grid-origin-y', `${top}px`)
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
  }, [ref, cell, target])
}
