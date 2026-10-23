import { render, screen, within } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { App } from '../src/app'

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }))
vi.mock('@md-viz/api-client/cache/react-query', () => ({ listNotesOptions: vi.fn() }))

describe('App', () => {
  beforeEach(() => {
    vi.mocked(useQuery).mockReturnValue({ isPending: true } as UseQueryResult)
  })

  it('renders the app header', () => {
    render(<App />)

    expect(screen.getByRole('banner')).toHaveTextContent('md-viz')
  })

  it('renders the cached notes under the header', () => {
    render(<App />)

    expect(within(screen.getByRole('main')).getByRole('status')).toHaveAccessibleName(
      'loading notes',
    )
  })
})
