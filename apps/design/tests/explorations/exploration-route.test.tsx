import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ExplorationRoute } from '../../src/explorations/exploration-route'

vi.mock('../../src/explorations/exploration-page', () => ({
  ExplorationPage: ({ exploration }: { exploration: { slug: string } }) => (
    <div>exploration {exploration.slug}</div>
  ),
}))
vi.mock('../../src/explorations/exploration-not-found', () => ({
  ExplorationNotFound: () => <div>exploration missing</div>,
}))

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="explorations/:slug" element={<ExplorationRoute />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ExplorationRoute', () => {
  it('shows the exploration of the slug', () => {
    renderAt('/explorations/background')

    expect(screen.getByText('exploration background')).toBeInTheDocument()
  })

  it('shows the not-found card for an unknown slug', () => {
    renderAt('/explorations/nope')

    expect(screen.getByText('exploration missing')).toBeInTheDocument()
  })
})
