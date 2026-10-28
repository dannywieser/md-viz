import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { SyncOverlay } from '../../../src/renderer/src/components/sync-overlay'

const props: ComponentProps<typeof SyncOverlay> = {
  scanning: false,
  scanProgress: null,
  syncing: false,
  syncProgress: null,
}

describe('SyncOverlay', () => {
  it('shows nothing while idle', () => {
    const { container } = render(<SyncOverlay {...props} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows what a scan has found, without a bar', () => {
    render(<SyncOverlay {...props} scanning scanProgress={{ dirs: 3, mdFiles: 7 }} />)

    expect(screen.getByRole('dialog', { name: 'scanning' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'scanning' })).toBeInTheDocument()
    expect(screen.getByText('3 folders, 7 notes so far')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('starts a scan at zero', () => {
    render(<SyncOverlay {...props} scanning />)

    expect(screen.getByText('0 folders, 0 notes so far')).toBeInTheDocument()
  })

  it('shows the notes pushed and deleted of the total, with a bar', () => {
    render(<SyncOverlay {...props} syncing syncProgress={{ synced: 3, deleted: 1, total: 8 }} />)

    expect(screen.getByRole('dialog', { name: 'syncing' })).toBeInTheDocument()
    expect(screen.getByText('3 pushed, 1 deleted of 8')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'sync progress' })).toHaveAttribute(
      'aria-valuenow',
      '4',
    )
  })

  it('shows no counts or bar until the sync reports', () => {
    render(<SyncOverlay {...props} syncing />)

    expect(screen.getByRole('dialog', { name: 'syncing' })).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.queryByText(/pushed/)).not.toBeInTheDocument()
  })

  it('shows the sync rather than the scan when both are going', () => {
    render(<SyncOverlay {...props} scanning syncing />)

    expect(screen.getByRole('dialog', { name: 'syncing' })).toBeInTheDocument()
  })
})
