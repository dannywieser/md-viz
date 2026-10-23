import { render, screen } from '@testing-library/react'
import { Button, buttonVariants } from '../src'

describe('Button', () => {
  it('is a default button with its variant and size on the element', () => {
    render(<Button>save</Button>)
    const button = screen.getByRole('button', { name: 'save' })

    expect(button).toHaveAttribute('data-slot', 'button')
    expect(button).toHaveAttribute('data-variant', 'default')
    expect(button).toHaveAttribute('data-size', 'default')
  })

  it('takes a variant, a size and extra classes', () => {
    render(
      <Button variant="outline" size="sm" className="extra">
        save
      </Button>,
    )
    const button = screen.getByRole('button')

    expect(button).toHaveAttribute('data-variant', 'outline')
    expect(button).toHaveAttribute('data-size', 'sm')
    expect(button).toHaveClass('extra')
  })

  it('renders its child instead of a button with asChild', () => {
    render(
      <Button asChild>
        <a href="/board">board</a>
      </Button>,
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'board' })).toHaveAttribute('data-slot', 'button')
  })

  it('exposes the class names for other elements', () => {
    expect(buttonVariants({ variant: 'ghost' })).toContain('hover:bg-accent')
  })
})
