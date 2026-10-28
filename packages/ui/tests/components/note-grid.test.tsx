import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { NoteGrid, type Note } from '../../src'

function makeNotes(count: number): Note[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `n${i}`,
    title: `note ${i}`,
    color: i % 10,
  }))
}

describe('NoteGrid', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(320)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('draws one square per note', () => {
    const { container } = render(<NoteGrid notes={makeNotes(12)} />)

    expect(container.querySelectorAll('.note-square')).toHaveLength(12)
  })

  it('fills the height of its container when no height is given', () => {
    const { container } = render(<NoteGrid notes={makeNotes(2000)} />)
    const area = container.querySelector('[data-slot="note-grid"]') as HTMLElement
    const svg = container.querySelector('svg')

    expect(area.style.height).toBe('')
    expect(area).toHaveClass('h-full')
    expect(Number(svg?.getAttribute('height'))).toBeLessThanOrEqual(320 + 3)
  })

  it('uses a fixed height when one is given', () => {
    const { container } = render(<NoteGrid notes={makeNotes(12)} height={200} />)
    const area = container.querySelector('[data-slot="note-grid"]') as HTMLElement

    expect(area.style.height).toBe('200px')
    expect(area).not.toHaveClass('h-full')
  })

  it('is a shadowed block floating on the page', () => {
    const { container } = render(<NoteGrid notes={makeNotes(3)} />)

    expect(container.querySelector('svg')?.parentElement).toHaveClass('bg-card', 'shadow-hard')
  })

  it('hangs a label with the count above the grid and makes room for it', () => {
    const { container } = render(<NoteGrid notes={makeNotes(3)} height={200} label="updated" />)
    const area = container.querySelector('[data-slot="note-grid"]') as HTMLElement
    const label = container.querySelector('[data-slot="card"]')

    expect(label).toHaveTextContent('updated 3')
    expect(label?.parentElement).toBe(container.querySelector('svg')?.parentElement)
    expect(Number(area.style.height.replace('px', ''))).toBeGreaterThan(200)
    expect(area.style.paddingTop).not.toBe('')
  })

  it('hands its block to the ref', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<NoteGrid ref={ref} notes={makeNotes(3)} />)

    expect(ref.current).toBe(container.querySelector('svg')?.parentElement)
  })

  it('has no per-note title elements', () => {
    const { container } = render(<NoteGrid notes={makeNotes(3)} />)

    expect(container.querySelectorAll('title')).toHaveLength(0)
  })

  describe('hover', () => {
    function hover(container: HTMLElement, index: number) {
      const svg = container.querySelector('svg')!
      const rect = container.querySelectorAll('.note-square')[index]
      const x = Number(rect.getAttribute('x')) + 2
      const y = Number(rect.getAttribute('y')) + 2
      fireEvent.pointerMove(svg, { clientX: x, clientY: y })
    }

    it('shows one shared tooltip and outline for the hovered note', () => {
      const { container } = render(<NoteGrid notes={makeNotes(6)} />)

      hover(container, 4)

      expect(screen.getByRole('tooltip')).toHaveTextContent('note 4')
      expect(container.querySelectorAll('.note-hover')).toHaveLength(1)
    })

    it('follows the pointer from cell to cell', () => {
      const { container } = render(<NoteGrid notes={makeNotes(6)} />)

      hover(container, 1)
      expect(screen.getByRole('tooltip')).toHaveTextContent('note 1')
      hover(container, 5)
      expect(screen.getByRole('tooltip')).toHaveTextContent('note 5')
    })

    describe('tooltip placement', () => {
      function stubTooltipRect(left: number, width: number) {
        vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
          this: Element,
        ) {
          const isTooltip = this.getAttribute('role') === 'tooltip'
          return { left: isTooltip ? left : 0, width: isTooltip ? width : 0, top: 0 } as DOMRect
        })
      }

      it('moves a tooltip that overflows the left edge to the right', () => {
        stubTooltipRect(-20, 80)
        const { container } = render(<NoteGrid notes={makeNotes(6)} />)

        hover(container, 0)

        expect(screen.getByRole('tooltip').style.marginLeft).toBe('28px')
      })

      it('moves a tooltip that overflows the right edge to the left', () => {
        stubTooltipRect(document.documentElement.clientWidth - 60, 80)
        const { container } = render(<NoteGrid notes={makeNotes(6)} />)

        hover(container, 5)

        expect(screen.getByRole('tooltip').style.marginLeft).toBe('-28px')
      })

      it('keeps a tooltip clear of the scrollbar, so it never makes the page scroll sideways', () => {
        // a classic scrollbar takes room from clientWidth but not from innerWidth
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(
          document.documentElement.clientWidth + 15,
        )
        stubTooltipRect(document.documentElement.clientWidth - 70, 80)
        const { container } = render(<NoteGrid notes={makeNotes(6)} />)

        hover(container, 5)

        expect(screen.getByRole('tooltip').style.marginLeft).toBe('-18px')
      })

      it('leaves a tooltip that fits centred', () => {
        stubTooltipRect(100, 80)
        const { container } = render(<NoteGrid notes={makeNotes(6)} />)

        hover(container, 2)

        expect(screen.getByRole('tooltip').style.marginLeft).toBe('0px')
      })
    })

    it('shows nothing over a placeholder, outside the grid, or after leaving', () => {
      const { container } = render(<NoteGrid notes={makeNotes(5)} />)
      const svg = container.querySelector('svg')!
      const placeholder = container.querySelector('.note-placeholder')!

      fireEvent.pointerMove(svg, {
        clientX: Number(placeholder.getAttribute('x')) + 2,
        clientY: Number(placeholder.getAttribute('y')) + 2,
      })
      expect(screen.queryByRole('tooltip')).toBeNull()

      fireEvent.pointerMove(svg, { clientX: -5, clientY: -5 })
      expect(screen.queryByRole('tooltip')).toBeNull()

      hover(container, 0)
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
      fireEvent.pointerLeave(svg)
      expect(screen.queryByRole('tooltip')).toBeNull()
    })
  })

  it('keeps every note visible as the set grows', () => {
    const { container } = render(<NoteGrid notes={makeNotes(5000)} />)

    expect(container.querySelectorAll('.note-square')).toHaveLength(5000)
  })

  it('draws bigger squares for fewer notes', () => {
    const squareSize = (count: number) => {
      const { container, unmount } = render(<NoteGrid notes={makeNotes(count)} />)
      const size = Number(container.querySelector('.note-square')?.getAttribute('width'))
      unmount()
      return size
    }

    expect(squareSize(5)).toBeGreaterThan(squareSize(100))
  })

  it('sizes the grid to its cells plus the gridline margin', () => {
    const { container } = render(<NoteGrid notes={makeNotes(2)} />)
    const svg = container.querySelector('svg')
    const cell = Number(container.querySelector('.note-square')?.getAttribute('width'))

    expect(Number(svg?.getAttribute('width'))).toBe(2 * cell + 3)
    expect(container.querySelectorAll('.note-placeholder')).toHaveLength(0)
  })

  it('is always a rectangle: placeholders fill the short last row', () => {
    const { container } = render(<NoteGrid notes={makeNotes(5)} />)
    const cell = Number(container.querySelector('.note-square')?.getAttribute('width'))
    const svg = container.querySelector('svg')
    const cells = (Number(svg?.getAttribute('width')) - 3) / cell
    const rows = (Number(svg?.getAttribute('height')) - 3) / cell

    expect(cells * rows).toBe(5 + container.querySelectorAll('.note-placeholder').length)
    expect(container.querySelectorAll('.note-placeholder').length).toBeGreaterThan(0)
  })

  it('has no border around the grid, so the hover outline stands alone', () => {
    const { container } = render(<NoteGrid notes={makeNotes(5)} />)

    expect(container.querySelector('.note-border')).toBeNull()
  })

  it('lets the hover outline extend past the svg so it is not clipped on edge cells', () => {
    const { container } = render(<NoteGrid notes={makeNotes(5)} />)

    expect(container.querySelector('svg')).toHaveClass('overflow-visible')
  })

  it('is not wrapped in a card', () => {
    const { container } = render(<NoteGrid notes={makeNotes(3)} />)

    expect(container.querySelector('[data-slot="card"]')).toBeNull()
  })

  it('wraps colour indexes onto the palette', () => {
    const notes = [
      { id: 'a', title: 'a', color: 13 },
      { id: 'b', title: 'b', color: -1 },
    ]
    const { container } = render(<NoteGrid notes={notes} />)

    const colors = [...container.querySelectorAll('.note-square')].map((el) =>
      el.getAttribute('data-color'),
    )
    expect(colors).toEqual(['3', '9'])
  })

  it('shows a lowercase empty state as a shadowed block, with its label', () => {
    const { container } = render(<NoteGrid notes={[]} label="deleted" />)

    const text = screen.getByText('the notes went out for coffee')
    expect(text.closest('[data-slot="empty-state"]')?.parentElement).toHaveClass('shadow-hard')
    expect(container.querySelector('[data-slot="card"]')).toHaveTextContent('deleted 0')
    const all = container.textContent
    expect(all).toBe(all.toLowerCase())
  })

  it('fills the drawing area with an empty block, less the stroke room', () => {
    const { container } = render(<NoteGrid notes={[]} height={160} />)
    const block = container.querySelector('[data-slot="empty-state"]')?.parentElement

    expect(block).toHaveStyle({ width: '397px', height: '157px' })
  })

  it('gives the empty block the size it is told to have', () => {
    const { container } = render(
      <NoteGrid notes={[]} height={160} emptySize={{ width: 267, height: 135 }} />,
    )
    const block = container.querySelector('[data-slot="empty-state"]')?.parentElement

    expect(block).toHaveStyle({ width: '267px', height: '135px' })
  })

  it('has no size on the empty block until its container has one', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(0)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(0)
    const { container } = render(<NoteGrid notes={[]} />)
    const block = container.querySelector('[data-slot="empty-state"]')?.parentElement

    expect(block?.style.width).toBe('')
  })

  it('shows the compact empty state when asked', () => {
    const { container } = render(<NoteGrid notes={[]} compactEmpty />)

    expect(container.querySelector('[data-slot="empty-state"]')).toHaveAttribute('data-compact')
    expect(screen.queryByText('the notes went out for coffee')).not.toBeInTheDocument()
  })

  it('draws nothing until its container has a size', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(0)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(0)
    const { container } = render(<NoteGrid notes={makeNotes(12)} />)

    expect(container.querySelectorAll('.note-square')).toHaveLength(0)
  })
})
