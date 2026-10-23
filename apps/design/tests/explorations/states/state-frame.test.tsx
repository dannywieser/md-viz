import { render, screen } from '@testing-library/react'
import { StateFrame } from '../../../src/explorations/states/state-frame'

describe('StateFrame', () => {
  it('captions its content without a second dot grid', () => {
    render(
      <StateFrame caption="alone">
        <p>content</p>
      </StateFrame>,
    )

    expect(screen.getByRole('figure')).toHaveTextContent('alone')
    expect(screen.getByText('content').parentElement).not.toHaveClass('bg-dots')
  })
})
