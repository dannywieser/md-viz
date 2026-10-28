import { render, screen } from '@testing-library/react'
import { WindowHeader } from '../../../src/explorations/sync-layout/window-header'

describe('WindowHeader', () => {
  it('has the buttons, enabled when idle', () => {
    render(<WindowHeader busy={false} />)

    expect(screen.getByRole('button', { name: 'sync' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'choose folder' })).toBeEnabled()
  })

  it('disables them while busy', () => {
    render(<WindowHeader busy />)

    expect(screen.getByRole('button', { name: 'sync' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'choose folder' })).toBeDisabled()
  })
})
