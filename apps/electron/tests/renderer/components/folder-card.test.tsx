import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { FolderCard } from '../../../src/renderer/src/components/folder-card'

const props: ComponentProps<typeof FolderCard> = {
  folder: '/notes',
  lastSync: null,
  scanning: false,
  scanProgress: null,
  count: null,
  syncing: false,
  syncProgress: null,
}

describe('FolderCard', () => {
  it('shows the folder and that it was never synced', () => {
    render(<FolderCard {...props} />)

    expect(screen.getByLabelText('chosen folder')).toHaveTextContent('/notes')
    expect(screen.getByText('never synced')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('takes extra classes for its width', () => {
    render(<FolderCard {...props} className="w-full" />)

    expect(screen.getByLabelText('chosen folder').parentElement).toHaveClass('w-full')
  })

  it('shows when it was last synced', () => {
    render(
      <FolderCard
        {...props}
        lastSync={{
          syncedAt: '2026-10-20T09:30:00.000Z',
          notes: { updated: [], deleted: [], unchanged: [] },
        }}
      />,
    )

    expect(screen.getByText(/^last synced /)).toBeInTheDocument()
  })

  it('shows the scan progress only while scanning', () => {
    const scanProgress = { dirs: 3, mdFiles: 7 }
    const { rerender } = render(<FolderCard {...props} scanning scanProgress={scanProgress} />)
    expect(screen.getByText('scanning… 3 folders, 7 notes so far')).toBeInTheDocument()

    rerender(<FolderCard {...props} scanProgress={scanProgress} />)
    expect(screen.queryByText(/so far/)).not.toBeInTheDocument()

    rerender(<FolderCard {...props} scanning />)
    expect(screen.queryByText(/so far/)).not.toBeInTheDocument()
  })

  it('shows the note count, singular or plural', () => {
    const { rerender } = render(<FolderCard {...props} count={1} />)
    expect(screen.getByText('1 note')).toBeInTheDocument()

    rerender(<FolderCard {...props} count={18} />)
    expect(screen.getByText('18 notes')).toBeInTheDocument()

    rerender(<FolderCard {...props} count={0} />)
    expect(screen.getByText('0 notes')).toBeInTheDocument()
  })

  it('shows the sync progress only while syncing', () => {
    const syncProgress = { synced: 3, deleted: 1, total: 8 }
    const { rerender } = render(<FolderCard {...props} syncing syncProgress={syncProgress} />)
    expect(screen.getByText('syncing… 3 pushed, 1 deleted of 8')).toBeInTheDocument()

    rerender(<FolderCard {...props} syncProgress={syncProgress} />)
    expect(screen.queryByText(/pushed/)).not.toBeInTheDocument()

    rerender(<FolderCard {...props} syncing />)
    expect(screen.queryByText(/pushed/)).not.toBeInTheDocument()
  })
})
