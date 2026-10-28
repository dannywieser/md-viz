import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { FolderCard } from '../../../src/renderer/src/components/folder-card'

const props: ComponentProps<typeof FolderCard> = {
  target: { source: 'file', folder: '/notes' },
  lastSync: null,
  count: null,
}

describe('FolderCard', () => {
  it('shows the folder and that it was never synced on one line', () => {
    render(<FolderCard {...props} />)

    expect(screen.getByLabelText('chosen source')).toHaveTextContent('/notes')
    expect(screen.getByText(/never synced/)).toBeInTheDocument()
    expect(screen.getByLabelText('chosen source').parentElement).toHaveTextContent(
      '/notes · never synced',
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows bear instead of a folder for the Bear source', () => {
    render(<FolderCard {...props} target={{ source: 'bear' }} />)

    expect(screen.getByLabelText('chosen source')).toHaveTextContent('bear')
  })

  it('shows when it was last synced', () => {
    render(
      <FolderCard
        {...props}
        lastSync={{
          syncedAt: '2026-10-20T09:30:00.000Z',
          notes: { updated: [], deleted: [], unchanged: [] },
          tagColors: {},
        }}
      />,
    )

    expect(screen.getByText(/last synced /)).toBeInTheDocument()
  })

  it('shows the note count, singular or plural', () => {
    const { rerender } = render(<FolderCard {...props} count={1} />)
    expect(screen.getByText('1 note')).toBeInTheDocument()

    rerender(<FolderCard {...props} count={18} />)
    expect(screen.getByText('18 notes')).toBeInTheDocument()

    rerender(<FolderCard {...props} count={0} />)
    expect(screen.getByText('0 notes')).toBeInTheDocument()
  })
})
