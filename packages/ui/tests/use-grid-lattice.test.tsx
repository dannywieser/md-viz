import { act, renderHook } from '@testing-library/react'
import { useDotLattice } from '../src/lib/use-dot-lattice'
import { useGridLattice } from '../src/lib/use-grid-lattice'

vi.mock('../src/lib/use-dot-lattice', () => ({ useDotLattice: vi.fn() }))

const lastLatticeArgs = () => vi.mocked(useDotLattice).mock.lastCall!

describe('useGridLattice', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('has no cell until the grid reports one', () => {
    const { result } = renderHook(() => useGridLattice())

    expect(result.current.cell).toBeNull()
    expect(lastLatticeArgs()[1]).toBeNull()
  })

  it('lines the page up with the grid once it reports its cell', () => {
    const { result } = renderHook(() => useGridLattice())

    act(() => result.current.onCellChange(12))

    expect(result.current.cell).toBe(12)
    expect(lastLatticeArgs()).toEqual([result.current.ref, 12])
  })

  it('ignores the reported cell while disabled', () => {
    const { result, rerender } = renderHook(({ enabled }) => useGridLattice(enabled), {
      initialProps: { enabled: true },
    })
    act(() => result.current.onCellChange(12))

    rerender({ enabled: false })

    expect(result.current.cell).toBeNull()
    expect(lastLatticeArgs()[1]).toBeNull()
  })
})
