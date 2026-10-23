import { lazy } from 'react'
import { render, screen } from '@testing-library/react'
import { ExplorationPage } from '../../src/explorations/exploration-page'

const exploration = {
  slug: 'one',
  title: 'first',
  description: 'the first one',
  Page: lazy(() => Promise.resolve({ default: () => <p>the exploration</p> })),
}

describe('ExplorationPage', () => {
  it('shows the loader, then the loaded page', async () => {
    render(<ExplorationPage exploration={exploration} />)
    expect(screen.getByRole('status', { name: 'loading' })).toBeInTheDocument()

    expect(await screen.findByText('the exploration')).toBeInTheDocument()
    expect(screen.queryByRole('status')).toBeNull()
  })
})
