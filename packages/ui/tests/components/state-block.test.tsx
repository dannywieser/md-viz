import { render, screen } from '@testing-library/react'
import { StateBlock } from '../../src'

describe('StateBlock', () => {
  it('is a card-coloured block with a hard shadow', () => {
    render(<StateBlock>inside</StateBlock>)

    expect(screen.getByText('inside')).toHaveClass('bg-card', 'shadow-hard')
  })

  it('is centred in its container when it fills', () => {
    const { container } = render(<StateBlock fill>inside</StateBlock>)

    expect(container.firstElementChild).toHaveClass('h-full', 'items-center', 'justify-center')
  })
})
