import { render, screen } from '@testing-library/react'
import { TodayWindow } from '../../../src/explorations/sync-layout/today-window'
import type { Phase } from '../../../src/explorations/sync-layout/fake-sync'

const show = (phase: Phase) => render(<TodayWindow phase={phase} percent={50} />)

describe('TodayWindow', () => {
  it('shows the card and the grids when done', () => {
    show('done')

    expect(screen.getByText(/last synced/)).toBeInTheDocument()
    expect(screen.getByText('652 notes')).toBeInTheDocument()
    expect(screen.getAllByRole('region')).toHaveLength(3)
  })

  it('shows text progress while scanning', () => {
    show('scanning')

    expect(screen.getByText(/scanning…/)).toBeInTheDocument()
    expect(screen.queryByText(/notes$/)).not.toBeInTheDocument()
  })

  it('shows text progress while syncing', () => {
    show('syncing')

    expect(screen.getByText(/syncing… 120 pushed/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'sync' })).toBeDisabled()
  })

  it('shows never synced with zero notes', () => {
    show('empty')

    expect(screen.getByText('never synced')).toBeInTheDocument()
    expect(screen.getByText('0 notes')).toBeInTheDocument()
  })

  it('shows never synced for a source never synced', () => {
    show('never')

    expect(screen.getByText('never synced')).toBeInTheDocument()
  })

  it('shows the error in place of the grids', () => {
    show('error')

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })
})
