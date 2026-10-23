import { render, screen } from '@testing-library/react'
import { ExplorationNotFound } from '../../src/explorations/exploration-not-found'

describe('ExplorationNotFound', () => {
  it('says so and links to all explorations', () => {
    render(<ExplorationNotFound />)

    expect(screen.getByRole('alert')).toHaveTextContent('no such exploration')
    expect(screen.getByRole('link', { name: 'all explorations' })).toHaveAttribute(
      'href',
      '/explorations',
    )
  })
})
