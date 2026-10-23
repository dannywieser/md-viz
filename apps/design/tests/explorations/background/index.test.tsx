import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { background } from '../../../src/explorations/background'

vi.mock('../../../src/explorations/background/background', () => ({
  Background: () => <p>the background page</p>,
}))

describe('background exploration', () => {
  it('is served at /explorations/background', () => {
    expect(background.slug).toBe('background')
  })

  it('loads the background page', async () => {
    render(
      <Suspense fallback="loading">
        <background.Page />
      </Suspense>,
    )

    expect(await screen.findByText('the background page')).toBeInTheDocument()
  })
})
