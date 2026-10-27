import { render, screen } from '@testing-library/react'
import { SyncWindow, type Placement } from '../../../src/explorations/sync-layout/sync-window'
import type { Detail, Phase } from '../../../src/explorations/sync-layout/fake-sync'

const show = (placement: Placement, phase: Phase, detail: Detail = 'note') =>
  render(
    <SyncWindow caption="a" placement={placement} phase={phase} percent={50} detail={detail} />,
  )

describe('SyncWindow', () => {
  it('shows the status row and the grids when done', () => {
    show('row', 'done')

    expect(screen.getByLabelText('chosen source')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('652 notes')
    expect(screen.getAllByRole('region')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'sync' })).toBeEnabled()
  })

  it('shows progress in the row while syncing', () => {
    show('row', 'syncing')

    expect(screen.getByRole('status', { name: 'syncing' })).toBeInTheDocument()
    expect(screen.getAllByRole('region')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'sync' })).toBeDisabled()
  })

  it('shows a strip with a bar under the row', () => {
    show('strip', 'syncing', 'batch')

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByText(/syncing notes 101–150 of 240/)).toBeInTheDocument()
    expect(screen.getAllByRole('region')).toHaveLength(3)
  })

  it('replaces the grids with the progress when it takes over', () => {
    show('takeover', 'syncing')

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })

  it('has no count and no bar while scanning', () => {
    show('strip', 'scanning')

    expect(screen.getByRole('status', { name: 'scanning' })).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.queryByText(/notes$/)).not.toBeInTheDocument()
  })

  it('shows the grids when the progress takes over but nothing runs', () => {
    show('takeover', 'done')

    expect(screen.getAllByRole('region')).toHaveLength(3)
  })

  it('shows never synced and an empty source', () => {
    show('row', 'never')
    expect(screen.getByLabelText('status')).toHaveTextContent('never synced')
  })

  it('shows zero notes for an empty source', () => {
    show('row', 'empty')
    expect(screen.getByRole('status')).toHaveTextContent('0 notes')
  })

  it('shows the error in place of the grids', () => {
    show('row', 'error')

    expect(screen.getByRole('alert')).toHaveTextContent('could not reach the cache')
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })
})
