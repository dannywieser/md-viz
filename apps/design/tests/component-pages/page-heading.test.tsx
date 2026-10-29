import { render, screen } from '@testing-library/react'
import { PageHeading } from '../../src/component-pages/page-heading'

describe('PageHeading', () => {
  it('shows the title and the description', () => {
    render(<PageHeading title="a title" description="a description" />)

    expect(screen.getByRole('heading', { level: 2, name: 'a title' })).toBeInTheDocument()
    expect(screen.getByText('a description')).toBeInTheDocument()
  })
})
