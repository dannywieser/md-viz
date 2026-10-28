import { render, screen } from '@testing-library/react'
import { SyncWindow, type Placement } from '../../../src/explorations/sync-layout/sync-window'
import type { Phase } from '../../../src/explorations/sync-layout/fake-sync'

const show = (placement: Placement, phase: Phase) =>
  render(<SyncWindow caption="a" placement={placement} phase={phase} percent={50} />)

describe('SyncWindow', () => {
  it('shows the status row and the grids when done', () => {
    show('overlay', 'done')

    expect(screen.getByLabelText('chosen source')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('652 notes')
    expect(screen.getAllByRole('region')).toHaveLength(3)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'sync' })).toBeEnabled()
  })

  it('shows the progress over the grids while syncing', () => {
    show('overlay', 'syncing')

    expect(screen.getByRole('dialog', { name: 'syncing' })).toBeInTheDocument()
    expect(screen.getByText('123 pushed, 0 deleted of 246')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getAllByRole('region')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'sync' })).toBeDisabled()
  })

  it('replaces the grids with the progress when solid', () => {
    show('takeover', 'syncing')

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })

  it('shows the grids when solid but nothing runs', () => {
    show('takeover', 'done')

    expect(screen.getAllByRole('region')).toHaveLength(3)
  })

  it('has no count and no bar while scanning', () => {
    show('overlay', 'scanning')

    expect(screen.getByRole('dialog', { name: 'scanning' })).toBeInTheDocument()
    expect(screen.getByText(/folders, .* notes so far/)).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.queryByText(/\d notes$/)).not.toBeInTheDocument()
  })

  it('shows never synced', () => {
    show('overlay', 'never')

    expect(screen.getByLabelText('status')).toHaveTextContent('never synced')
  })

  it('shows zero notes for an empty source', () => {
    show('overlay', 'empty')

    expect(screen.getByRole('status')).toHaveTextContent('0 notes')
  })

  it('shows the error in place of the grids', () => {
    show('overlay', 'error')

    expect(screen.getByRole('alert')).toHaveTextContent('could not reach the cache')
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })
})
