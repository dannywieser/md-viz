import { render, screen } from '@testing-library/react'
import { SyncProgress } from '../../../src/explorations/sync-layout/sync-progress'

const props = { line: 'syncing notes', count: '10 pushed, 0 deleted of 20', label: 'syncing' }

describe('SyncProgress', () => {
  it('shows the loader, the line, the count and a bar', () => {
    render(<SyncProgress {...props} bar={{ value: 10, max: 20 }} />)

    expect(screen.getByRole('status', { name: 'syncing' })).toBeInTheDocument()
    expect(screen.getByText('syncing notes')).toBeInTheDocument()
    expect(screen.getByText('10 pushed, 0 deleted of 20')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'syncing progress' })).toBeInTheDocument()
  })

  it('has no bar when the total is not known', () => {
    render(<SyncProgress {...props} bar={null} />)

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
