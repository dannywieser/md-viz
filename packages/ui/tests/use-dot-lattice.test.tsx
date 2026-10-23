import { render } from '@testing-library/react'
import { useRef } from 'react'
import { latticeSpacing } from '../src/lib/note-grid-layout'
import { useDotLattice } from '../src/lib/use-dot-lattice'

function Host({ cell, square = true }: { cell: number | null; square?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useDotLattice(ref, cell)
  return (
    <div ref={ref}>
      <svg>{square && <rect className="note-square" />}</svg>
    </div>
  )
}

describe('useDotLattice', () => {
  const root = document.documentElement

  it('sets the page lattice from the first note square and clears it on unmount', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(40, 24, 8, 8))
    const { unmount } = render(<Host cell={8} />)

    expect(root.style.getPropertyValue('--grid-size')).toBe(`${latticeSpacing(8)}px`)
    expect(root.style.getPropertyValue('--grid-origin-x')).toBe('40px')
    expect(root.style.getPropertyValue('--grid-origin-y')).toBe('24px')

    unmount()
    expect(root.style.getPropertyValue('--grid-size')).toBe('')
    vi.restoreAllMocks()
  })

  it('leaves the page alone without a cell', () => {
    render(<Host cell={null} />)
    expect(root.style.getPropertyValue('--grid-size')).toBe('')
  })

  it('leaves the page alone while the grid has no squares', () => {
    render(<Host cell={8} square={false} />)

    expect(root.style.getPropertyValue('--grid-size')).toBe('')
  })

  it('follows the grid and the page as they resize, and stops observing on unmount', () => {
    let notify: () => void = () => {}
    const observed: Element[] = []
    const disconnect = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback
        }
        observe(element: Element) {
          observed.push(element)
        }
        disconnect = disconnect
      },
    )
    const box = vi.spyOn(Element.prototype, 'getBoundingClientRect')
    box.mockReturnValue(new DOMRect(40, 24, 8, 8))
    const { unmount } = render(<Host cell={8} />)
    expect(observed).toContain(root)
    expect(observed).toHaveLength(2)

    box.mockReturnValue(new DOMRect(60, 30, 8, 8))
    notify()
    expect(root.style.getPropertyValue('--grid-origin-x')).toBe('60px')
    expect(root.style.getPropertyValue('--grid-origin-y')).toBe('30px')

    unmount()
    expect(disconnect).toHaveBeenCalledOnce()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })
})
