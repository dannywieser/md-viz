import { render, screen } from '@testing-library/react'
import { SyncProgress } from '../../../src/explorations/sync-layout/sync-progress'

const props = {
  line: 'syncing garden plan 1',
  count: '10 of 20 pushed',
  bar: { value: 10, max: 20 },
  label: 'syncing',
}

describe('SyncProgress', () => {
  it.each(['inline', 'strip', 'center'] as const)(
    'shows the loader, line and count (%s)',
    (shape) => {
      render(<SyncProgress shape={shape} {...props} />)

      expect(screen.getByRole('status', { name: 'syncing' })).toBeInTheDocument()
      expect(screen.getByText(/syncing garden plan 1/)).toBeInTheDocument()
      expect(screen.getByText(/10 of 20 pushed/)).toBeInTheDocument()
    },
  )

  it('draws a bar in the strip and the centre but not inline', () => {
    const { rerender } = render(<SyncProgress shape="inline" {...props} />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()

    rerender(<SyncProgress shape="strip" {...props} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    rerender(<SyncProgress shape="center" {...props} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it.each(['strip', 'center'] as const)('has no bar when the total is not known (%s)', (shape) => {
    render(<SyncProgress shape={shape} {...props} bar={null} />)

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
