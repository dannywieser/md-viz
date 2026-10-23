import { render } from '@testing-library/react'
import { useRef } from 'react'
import { latticeSpacing } from '../src/lib/note-grid-layout'
import { useDotLattice } from '../src/lib/use-dot-lattice'

function Host({ cell }: { cell: number | null }) {
  const ref = useRef<HTMLDivElement>(null)
  useDotLattice(ref, cell)
  return (
    <div ref={ref}>
      <svg>
        <rect className="note-square" />
      </svg>
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
})
