import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../src/app'

vi.mock('../src/components/dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard" />,
}))

// jsdom lacks the pointer and scroll APIs radix select uses.
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => undefined
  Element.prototype.releasePointerCapture = () => undefined
  Element.prototype.scrollIntoView = () => undefined
})

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('data-theme')
})

describe('App', () => {
  it('renders the app header', () => {
    render(<App />)

    expect(screen.getByRole('banner')).toHaveTextContent('md-viz')
  })

  it('renders the dashboard under the header', () => {
    render(<App />)

    expect(within(screen.getByRole('main')).getByTestId('dashboard')).toBeInTheDocument()
  })

  it('shows the theme switcher in the header, on solarized', () => {
    render(<App />)

    expect(
      within(screen.getByRole('banner')).getByRole('combobox', { name: 'theme' }),
    ).toHaveAttribute('title', 'solarized')
    expect(document.documentElement.dataset.theme).toBe('solarized')
  })

  it('applies the theme that is picked', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('combobox', { name: 'theme' }))
    await userEvent.click(screen.getByRole('option', { name: 'gotham' }))

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('gotham'))
    expect(screen.getByRole('combobox', { name: 'theme' })).toHaveAttribute('title', 'gotham')
  })
})
