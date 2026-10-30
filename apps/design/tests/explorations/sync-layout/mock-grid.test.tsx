import { render, screen } from '@testing-library/react'
import { MockGrid } from '../../../src/explorations/sync-layout/mock-grid'

const notes = [
  { id: 'a', title: 'first' },
  { id: 'b', title: 'second' },
]

describe('MockGrid', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(200)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('draws the notes as one set, with its label in the bar', () => {
    render(<MockGrid notes={notes} label="updated" height={160} />)

    expect(screen.getByText('updated: 2 notes in 1 set')).toBeInTheDocument()
  })

  it('has a fixed height under the bar when given one', () => {
    const { container } = render(<MockGrid notes={notes} label="updated" height={160} />)

    expect(container.firstElementChild).toHaveStyle({ height: '192px' })
  })

  it('fills its column without a height', () => {
    const { container } = render(<MockGrid notes={notes} label="updated" height={undefined} />)

    expect(container.firstElementChild).toHaveClass('h-full')
  })
})
