import { render, screen } from '@testing-library/react'
import { ProgressBar } from '../../src/components/progress-bar'

describe('ProgressBar', () => {
  it('shows how far along it is', () => {
    render(<ProgressBar value={30} max={120} label="sync progress" />)

    const bar = screen.getByRole('progressbar', { name: 'sync progress' })
    expect(bar).toHaveAttribute('aria-valuenow', '30')
    expect(bar.firstElementChild).toHaveStyle({ width: '25%' })
  })

  it('is empty when there is nothing to do', () => {
    render(<ProgressBar value={0} max={0} label="sync progress" />)

    expect(screen.getByRole('progressbar').firstElementChild).toHaveStyle({ width: '0%' })
  })
})
