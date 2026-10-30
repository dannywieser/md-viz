import { render } from '@testing-library/react'
import { BlockLabel } from '../../../src/explorations/note-grid-sets/block-label'

const base = { x: 0, y: 0, width: 200, height: 100, text: 'set a 50' }

function draw(props: Partial<Parameters<typeof BlockLabel>[0]>) {
  return render(
    <svg>
      <BlockLabel {...base} mode="inside" {...props} />
    </svg>,
  )
}

describe('BlockLabel', () => {
  it('draws nothing without labels', () => {
    const { container } = draw({ mode: 'none' })

    expect(container.querySelector('text')).toBeNull()
  })

  it('draws a chip inside the block', () => {
    const { container } = draw({ mode: 'inside' })

    expect(container.querySelector('text')).toHaveTextContent('set a 50')
    expect(container.querySelector('rect')).toHaveAttribute('x', '3')
  })

  it('cuts the text to the width inside', () => {
    const { container } = draw({ mode: 'inside', width: 60 })

    expect(container.querySelector('text')).toHaveTextContent('set a…')
  })

  it('draws nothing when no character fits', () => {
    const { container } = draw({ mode: 'inside', width: 16 })

    expect(container.querySelector('g')).toBeNull()
  })

  it('hangs a tab flush on the corner', () => {
    const { container } = draw({ mode: 'tab' })

    expect(container.querySelector('rect')).toHaveAttribute('x', '0')
    expect(container.querySelector('rect')).toHaveAttribute('stroke-width', '1')
  })

  it('draws no tab on a block shorter than the tab', () => {
    const { container } = draw({ mode: 'tab', height: 10 })

    expect(container.querySelector('g')).toBeNull()
  })

  it('shows the whole text where it fits with a threshold', () => {
    const { container } = draw({ mode: 'threshold' })

    expect(container.querySelector('text')).toHaveTextContent('set a 50')
  })

  it('shows nothing where the whole text does not fit with a threshold', () => {
    const { container } = draw({ mode: 'threshold', width: 60 })

    expect(container.querySelector('g')).toBeNull()
  })
})
