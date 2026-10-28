import { render, screen } from '@testing-library/react'
import { AppFrame } from '../../../src/explorations/sync-layout/app-frame'

describe('AppFrame', () => {
  it('captions the window with its size and fixes that size', () => {
    render(
      <AppFrame caption="a window" width={880} height={520}>
        <p>content</p>
      </AppFrame>,
    )

    expect(screen.getByText('a window · 880×520')).toBeInTheDocument()
    expect(screen.getByText('content').parentElement).toHaveStyle({
      width: '880px',
      height: '520px',
    })
    expect(screen.getByText('content').parentElement).not.toHaveClass('bg-dots')
  })
})
