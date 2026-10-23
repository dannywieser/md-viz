import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { states } from '../../../src/explorations/states'

vi.mock('../../../src/explorations/states/states', () => ({
  States: () => <p>the states page</p>,
}))

describe('states exploration', () => {
  it('is served at /explorations/states', () => {
    expect(states.slug).toBe('states')
  })

  it('loads the states page', async () => {
    render(
      <Suspense fallback="loading">
        <states.Page />
      </Suspense>,
    )

    expect(await screen.findByText('the states page')).toBeInTheDocument()
  })
})
