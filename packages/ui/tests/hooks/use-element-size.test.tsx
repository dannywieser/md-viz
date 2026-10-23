import { act, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { useElementSize } from '../../src/hooks/use-element-size'

function Probe() {
  const ref = useRef<HTMLDivElement>(null)
  const { width, height } = useElementSize(ref)
  return (
    <div ref={ref}>
      <span data-testid="size">{`${width}x${height}`}</span>
    </div>
  )
}

describe('useElementSize', () => {
  let width = 200
  let height = 100
  let notify: () => void = () => {}

  beforeEach(() => {
    width = 200
    height = 100
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => width)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => height)
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback
        }
        observe() {}
        disconnect() {}
      },
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('reports the size on mount', () => {
    render(<Probe />)

    expect(screen.getByTestId('size')).toHaveTextContent('200x100')
  })

  it('updates when the element resizes', () => {
    render(<Probe />)
    width = 350
    height = 420
    act(() => notify())

    expect(screen.getByTestId('size')).toHaveTextContent('350x420')
  })

  it('keeps the same state when a resize leaves the size unchanged', () => {
    render(<Probe />)

    act(() => notify())

    expect(screen.getByTestId('size')).toHaveTextContent('200x100')
  })

  it('measures once when the browser has no ResizeObserver', () => {
    vi.unstubAllGlobals()
    render(<Probe />)

    expect(screen.getByTestId('size')).toHaveTextContent('200x100')
  })
})
