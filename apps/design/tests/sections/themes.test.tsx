import { render, screen } from '@testing-library/react'
import { themes } from '@md-viz/ui'
import { expectLowercase } from '../lowercase'
import { Themes } from '../../src/sections/themes'

describe('Themes', () => {
  it('shows a row for every theme', () => {
    const { container } = render(<Themes />)

    expect(screen.getByRole('heading', { level: 2, name: 'themes' })).toBeInTheDocument()
    expect(screen.getAllByRole('group')).toHaveLength(themes.length)
    expectLowercase(container)
  })
})
