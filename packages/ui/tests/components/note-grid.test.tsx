import { act, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { NoteGrid, makeFakeSets, type GridSet } from '../../src'
import { MOTION_LIMIT } from '../../src/components/note-grid'

const sets: GridSet[] = [
  {
    id: 'a',
    name: 'alpha',
    color: 2,
    notes: [
      { id: 'n1', title: 'first' },
      { id: 'n3', title: 'third' },
    ],
  },
  { id: 'b', name: 'beta', color: 5, notes: [{ id: 'n2', title: 'second' }] },
]

/** the grid's drawing: the toggle and the empty state have svgs of their own. */
const gridSvg = (container: HTMLElement) => container.querySelector('svg[role="img"]')

const squareRects = (container: HTMLElement) => container.querySelectorAll('svg g > rect')

/** the centre of the nth square, as the pointer position over the svg (jsdom boxes sit at 0,0). */
function centreOf(container: HTMLElement, index: number) {
  const rect = squareRects(container)[index] as SVGRectElement
  const [, x, y] = /translate\(([\d.]+)px, ([\d.]+)px\)/.exec(rect.style.transform)!
  const size = Number(rect.style.width.replace('px', ''))
  return { clientX: Number(x) + size / 2, clientY: Number(y) + size / 2 }
}

describe('NoteGrid', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(320)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Reflect.deleteProperty(window, 'matchMedia')
  })

  it('draws one square per note, coloured by its set, in the order of the note ids', () => {
    const { container } = render(<NoteGrid sets={sets} />)
    const rects = [...squareRects(container)] as SVGRectElement[]

    expect(rects.map((rect) => rect.style.fill)).toEqual([
      'var(--note-2)',
      'var(--note-5)',
      'var(--note-2)',
    ])
  })

  it('fills its container: a shadowed block as wide as it, the bar above the squares', () => {
    const { container } = render(<NoteGrid sets={sets} />)
    const svg = gridSvg(container) as SVGSVGElement
    const block = svg.parentElement as HTMLElement

    expect(block).toHaveClass('bg-card', 'shadow-hard')
    expect(block.style.width).toBe('400px')
    expect(svg.getAttribute('width')).toBe('400')
    expect(svg.getAttribute('height')).toBe('288')
    expect(block.firstElementChild).toHaveAttribute('data-slot', 'note-grid-bar')
  })

  it('starts not grouped and shows the totals, and the label before them', () => {
    const { rerender } = render(<NoteGrid sets={sets} />)

    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'not grouped: 3 notes in 2 sets')
    expect(screen.getByText('3 notes in 2 sets')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'group notes by set' })).toBeInTheDocument()

    rerender(<NoteGrid sets={sets} label="all notes" />)

    expect(screen.getByText('all notes: 3 notes in 2 sets')).toBeInTheDocument()
  })

  it('switches between not grouped and grouped with the toggle, fading the outline in and out', () => {
    const { container } = render(<NoteGrid sets={sets} />)
    const outline = container.querySelector('[data-outline]') as SVGPathElement
    expect(outline.style.opacity).toBe('0')

    fireEvent.click(screen.getByRole('button', { name: 'group notes by set' }))

    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'grouped: 3 notes in 2 sets')
    expect(outline.style.opacity).toBe('1')
    expect(screen.getByRole('button', { name: 'ungroup notes' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'ungroup notes' }))

    expect(outline.style.opacity).toBe('0')
  })

  it('moves each square to its place in the other state', () => {
    const { container } = render(<NoteGrid sets={makeFakeSets([30, 6, 2])} />)
    const places = () =>
      [...squareRects(container)].map((rect) => (rect as SVGRectElement).style.transform)
    const before = places()

    fireEvent.click(screen.getByRole('button', { name: 'group notes by set' }))

    expect(places()).toHaveLength(before.length)
    expect(places()).not.toEqual(before)
  })

  it('names the hovered note and its set in the bar and outlines the square', () => {
    const { container } = render(<NoteGrid sets={sets} />)
    const svg = gridSvg(container) as SVGSVGElement

    fireEvent.pointerMove(svg, centreOf(container, 1))

    expect(screen.getByText('beta')).toBeInTheDocument()
    expect(screen.getByText('second')).toBeInTheDocument()
    expect(container.querySelector('.note-hover')).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    fireEvent.pointerLeave(svg)

    expect(screen.queryByText('second')).not.toBeInTheDocument()
    expect(container.querySelector('.note-hover')).not.toBeInTheDocument()
  })

  it('finds the hovered note in the grouped layout too', () => {
    const { container } = render(<NoteGrid sets={sets} />)
    fireEvent.click(screen.getByRole('button', { name: 'group notes by set' }))

    fireEvent.pointerMove(gridSvg(container)!, centreOf(container, 1))

    expect(screen.getByText('second')).toBeInTheDocument()
  })

  it('shows nothing hovered outside the squares', () => {
    const { container } = render(<NoteGrid sets={sets} />)
    const svg = gridSvg(container) as SVGSVGElement

    fireEvent.pointerMove(svg, centreOf(container, 0))
    fireEvent.pointerMove(svg, { clientX: -50, clientY: -50 })

    expect(container.querySelector('.note-hover')).not.toBeInTheDocument()
  })

  it('shows nothing hovered over an empty cell', () => {
    const { container } = render(<NoteGrid sets={makeFakeSets([5])} />)
    const svg = gridSvg(container) as SVGSVGElement

    fireEvent.pointerMove(svg, { clientX: 399, clientY: 287 })

    expect(container.querySelector('.note-hover')).not.toBeInTheDocument()
  })

  it('reports the cell of the state shown', () => {
    const onCellChange = vi.fn()
    render(<NoteGrid sets={makeFakeSets([30, 6, 2])} onCellChange={onCellChange} />)

    expect(onCellChange).toHaveBeenCalledWith(expect.any(Number))
    const natural = onCellChange.mock.calls.at(-1)?.[0]

    fireEvent.click(screen.getByRole('button', { name: 'group notes by set' }))

    expect(onCellChange.mock.calls.at(-1)?.[0]).not.toBe(natural)
  })

  it('has an unseen square at the corner of the first cell for the dots to follow', () => {
    const { container } = render(<NoteGrid sets={sets} />)
    const marker = container.querySelector('.note-square') as SVGRectElement

    expect(marker.parentElement).toBe(gridSvg(container))
    expect(marker.style.fill).toBe('none')
  })

  it('gives the block as its ref', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<NoteGrid sets={sets} ref={ref} />)

    expect(ref.current).toBe(gridSvg(container)?.parentElement)
  })

  it('shows the empty state in a block as big as the container when there are no notes', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<NoteGrid sets={[]} ref={ref} />)

    expect(gridSvg(container)).not.toBeInTheDocument()
    expect(screen.getByText('the notes went out for coffee')).toBeInTheDocument()
    expect(ref.current).toHaveClass('shadow-hard')
    expect(ref.current?.style.width).toBe('400px')
    expect(ref.current?.style.height).toBe('320px')
  })

  it('says note and set in the singular for one', () => {
    render(<NoteGrid sets={makeFakeSets([1])} />)

    expect(screen.getByText('1 note in 1 set')).toBeInTheDocument()
  })

  it('leaves out sets without notes', () => {
    render(<NoteGrid sets={[{ id: 'x', name: 'x', color: 1, notes: [] }, ...sets]} />)

    expect(screen.getByText('3 notes in 2 sets')).toBeInTheDocument()
  })

  it('draws nothing before its container has a size', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(0)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(0)
    const { container } = render(<NoteGrid sets={sets} />)

    expect(gridSvg(container)).not.toBeInTheDocument()
    expect(screen.queryByText('the notes went out for coffee')).not.toBeInTheDocument()
  })

  it('takes a class', () => {
    const { container } = render(<NoteGrid sets={sets} className="extra" />)

    expect(container.querySelector('[data-slot="note-grid"]')).toHaveClass('extra')
  })

  describe('motion', () => {
    it('moves the squares with a transition up to the motion limit', () => {
      const { container } = render(<NoteGrid sets={sets} />)

      expect((squareRects(container)[0] as SVGRectElement).style.transition).toContain('transform')
    })

    it('fades the grid instead of moving the squares above the motion limit', () => {
      const animate = vi.fn()
      Object.defineProperty(SVGElement.prototype, 'animate', { value: animate, configurable: true })
      try {
        const { container } = render(<NoteGrid sets={makeFakeSets([MOTION_LIMIT, 50])} />)
        expect((squareRects(container)[0] as SVGRectElement).style.transition).toBe('')
        expect(animate).not.toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'group notes by set' }))

        expect(animate).toHaveBeenCalledTimes(1)
      } finally {
        Reflect.deleteProperty(SVGElement.prototype, 'animate')
      }
    })

    it('does not move the squares for a user who prefers reduced motion', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: () => ({ matches: true }),
        configurable: true,
      })
      const { container } = render(<NoteGrid sets={sets} />)

      expect((squareRects(container)[0] as SVGRectElement).style.transition).toBe('')
    })

    it('switches without a fade when the browser cannot animate', () => {
      render(<NoteGrid sets={makeFakeSets([MOTION_LIMIT, 50])} />)

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'group notes by set' }))
      })

      expect(screen.getByRole('button', { name: 'ungroup notes' })).toBeInTheDocument()
    })
  })
})
