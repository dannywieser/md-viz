import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { NoteGrid, type Note } from '../src'

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

    expect(screen.getByText('no notes')).toBeInTheDocument()
    expect(screen.getByText('no notes').parentElement).toHaveClass('shadow-hard')
    expect(container.querySelector('[data-slot="card"]')).toHaveTextContent('deleted 0')
    const text = container.textContent
    expect(text).toBe(text.toLowerCase())
  })
})
