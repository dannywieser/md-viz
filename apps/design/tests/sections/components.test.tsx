import { render, screen } from '@testing-library/react'
import { expectLowercase } from '../lowercase'
import { Components } from '../../src/sections/components'

describe('Components', () => {
  it('shows its section', () => {
    const { container } = render(<Components />)

    expect(screen.getByRole('heading', { level: 2, name: 'components' })).toBeInTheDocument()
    for (const name of ['secondary', 'outline', 'ghost', 'destructive', 'link', 'disabled']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.getByText('card title')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'message' })).toBeInTheDocument()
    expect(screen.getByText('loading notes')).toBeInTheDocument()
    expect(screen.getAllByRole('alert')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'back to the board' })).toBeInTheDocument()
    expect(screen.getByText('fill centres it in its container')).toBeInTheDocument()
    expectLowercase(container)
  })
})
