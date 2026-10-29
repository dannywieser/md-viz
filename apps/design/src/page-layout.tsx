import { Outlet } from 'react-router'

/** the frame of the board's pages: nearly the full width, the sections stacked. */
export function PageLayout() {
  return (
    <main className="space-y-8 p-4">
      <Outlet />
    </main>
  )
}
