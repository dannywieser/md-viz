import { render, screen } from '@testing-library/react'
import { AppHeader } from '../src'

describe('AppHeader', () => {
  it('renders the title as a heading inside a banner', () => {
    render(<AppHeader title="notes" />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'notes' })).toBeInTheDocument()
  })

  it('shows the wordmark and keeps the title as its accessible name', () => {
    render(<AppHeader title="notes" subtitle="design" />)

    expect(screen.getByRole('heading', { level: 1 }).querySelector('svg')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName('notes')
  })

  it('renders actions beside the title', () => {
    render(
      <AppHeader title="notes">
        <button>sync</button>
      </AppHeader>,
    )

    expect(screen.getByRole('button', { name: 'sync' })).toBeInTheDocument()
  })

  it('floats centered with a border and shadow instead of spanning the full width', () => {
    render(<AppHeader title="notes" />)

    expect(screen.getByRole('banner')).toHaveClass(
      'mx-4',
      'mt-4',
      'border',
      'shadow-hard',
      'bg-card',
    )
    expect(screen.getByRole('banner')).not.toHaveClass('border-b')
  })
})
