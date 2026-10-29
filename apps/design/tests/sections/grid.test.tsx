import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectLowercase } from '../lowercase'
import { Grid } from '../../src/sections/grid'
import { LatticeDemo } from '../../src/sections/lattice-demo'

vi.mock('../../src/sections/lattice-demo', () => ({ LatticeDemo: vi.fn(() => <div>demo</div>) }))

describe('Grid', () => {
  it('shows its section', () => {
    const { container } = render(<Grid />)

    expect(screen.getByRole('heading', { level: 2, name: 'grid' })).toBeInTheDocument()
    expect(screen.getByText('--grid-size')).toBeInTheDocument()
    expect(screen.getByText('--grid-dot')).toBeInTheDocument()
    expectLowercase(container)
  })

  it('starts on 150 notes and switches the demo to a preset', async () => {
    render(<Grid />)
    expect(vi.mocked(LatticeDemo).mock.calls.at(-1)![0].count).toBe(150)

    await userEvent.click(screen.getByRole('button', { name: '3000 notes' }))

    expect(vi.mocked(LatticeDemo).mock.calls.at(-1)![0].count).toBe(3000)
  })
})
