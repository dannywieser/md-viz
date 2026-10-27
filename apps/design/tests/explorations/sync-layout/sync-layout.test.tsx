import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SyncLayout } from '../../../src/explorations/sync-layout/sync-layout'

describe('SyncLayout', () => {
  it('shows today and the three placements while syncing', () => {
    render(<SyncLayout />)

    for (const name of [
      'today',
      'a: in the status row',
      'b: a strip under the row',
      'c: in place of the grids',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
    expect(screen.getAllByRole('progressbar')).toHaveLength(2)
  })

  it('switches the state', async () => {
    render(<SyncLayout />)

    await userEvent.click(screen.getByRole('button', { name: 'error' }))

    expect(screen.getAllByRole('alert')).toHaveLength(4)
  })

  it('switches what the line says', async () => {
    render(<SyncLayout />)

    await userEvent.click(screen.getByRole('button', { name: 'batch' }))

    expect(
      screen.getAllByText(/syncing notes 1–50 of 240|syncing notes \d+–\d+ of 240/).length,
    ).toBeGreaterThan(0)
  })

  it('moves the progress', () => {
    render(<SyncLayout />)

    fireEvent.change(screen.getByLabelText('how far along'), { target: { value: '100' } })

    expect(screen.getByText('100%')).toBeInTheDocument()
  })
})
