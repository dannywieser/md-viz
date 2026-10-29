import { render, screen } from '@testing-library/react'
import { DemoBox } from '../../src/component-pages/demo-box'

describe('DemoBox', () => {
  it('is the page background with dots, and takes extra classes', () => {
    render(
      <DemoBox className="h-10" data-testid="box">
        in the box
      </DemoBox>,
    )

    const box = screen.getByTestId('box')
    expect(box).toHaveTextContent('in the box')
    expect(box).toHaveClass('bg-dots', 'bg-background', 'h-10')
  })
})
