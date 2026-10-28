import { render, screen, within } from '@testing-library/react'
import { App } from '../src/app'

vi.mock('../src/components/dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard" />,
}))

describe('App', () => {
  it('renders the app header', () => {
    render(<App />)

    expect(screen.getByRole('banner')).toHaveTextContent('md-viz')
  })

  it('renders the dashboard under the header', () => {
    render(<App />)

    expect(within(screen.getByRole('main')).getByTestId('dashboard')).toBeInTheDocument()
  })
})
