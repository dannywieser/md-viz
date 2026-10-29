import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { PageLayout } from '../src/page-layout'

describe('PageLayout', () => {
  it('wraps the page in the main landmark', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<PageLayout />}>
            <Route index element={<p>a page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('main')).toHaveTextContent('a page')
  })
})
