import { render, screen } from '@testing-library/react'
import { DemoGroup } from '../../src/component-pages/demo-group'

describe('DemoGroup', () => {
  it('shows a heading over its content', () => {
    render(
      <DemoGroup title="a demo">
        <p>the demo</p>
      </DemoGroup>,
    )

    expect(screen.getByRole('heading', { level: 3, name: 'a demo' })).toBeInTheDocument()
    expect(screen.getByText('the demo')).toBeInTheDocument()
  })
})
