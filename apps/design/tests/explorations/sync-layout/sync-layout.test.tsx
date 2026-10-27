import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SyncLayout } from '../../../src/explorations/sync-layout/sync-layout'

describe('SyncLayout', () => {
  it('shows the overlay, the solid block and today while syncing', () => {
    render(<SyncLayout />)

    for (const name of ['c: overlay', 'c: solid', 'today']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
    expect(screen.getAllByRole('progressbar')).toHaveLength(2)
  })

  it('switches the state', async () => {
    render(<SyncLayout />)

    await userEvent.click(screen.getByRole('button', { name: 'error' }))

    expect(screen.getAllByRole('alert')).toHaveLength(3)
  })

  it('moves the progress', () => {
    render(<SyncLayout />)

    fireEvent.change(screen.getByLabelText('how far along'), { target: { value: '100' } })

    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getAllByText('240 pushed, 6 deleted of 246')).toHaveLength(2)
  })
})
