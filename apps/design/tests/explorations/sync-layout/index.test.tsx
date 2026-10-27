import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { syncLayout } from '../../../src/explorations/sync-layout'

vi.mock('../../../src/explorations/sync-layout/sync-layout', () => ({
  SyncLayout: () => <p>the sync layout page</p>,
}))

describe('sync layout exploration', () => {
  it('is served at /explorations/sync-layout', () => {
    expect(syncLayout.slug).toBe('sync-layout')
  })

  it('loads the sync layout page', async () => {
    render(
      <Suspense fallback="loading">
        <syncLayout.Page />
      </Suspense>,
    )

    expect(await screen.findByText('the sync layout page')).toBeInTheDocument()
  })
})
