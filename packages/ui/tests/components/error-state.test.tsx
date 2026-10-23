import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorState } from '../../src'

describe('ErrorState', () => {
  it('is an alert with a broken tile and a whimsical line', () => {
    const { container } = render(<ErrorState />)

    expect(screen.getByRole('alert')).toHaveTextContent('oops, we dropped a square')
    expect(container.querySelector('[data-slot="pixel-icon"]')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows the detail lowercased under the line', () => {
    render(<ErrorState detail="Not A Directory" />)

    expect(screen.getByText('not a directory')).toHaveClass('text-muted-foreground')
  })

  it('offers a retry only when it can be retried', async () => {
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)

    await userEvent.click(screen.getByRole('button', { name: 'try again' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows an action last and its own text', () => {
    render(<ErrorState action={<a href="/back">back</a>}>No Such Page</ErrorState>)

    expect(screen.getByRole('link', { name: 'back' })).toHaveAttribute('href', '/back')
    expect(screen.getByText('no such page')).toBeInTheDocument()
  })
})
