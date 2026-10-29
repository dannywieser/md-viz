import { NavLink, Outlet } from 'react-router'
import { components } from './registry'

/** the components section: a side nav and the page of the chosen component. */
export function ComponentsLayout() {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <nav aria-label="components" className="shrink-0 border bg-card p-2 shadow-hard md:w-48">
        <ul className="flex flex-wrap gap-1 md:flex-col">
          {components.map(({ slug, title }) => (
            <li key={slug}>
              <NavLink
                to={`/components/${slug}`}
                className={({ isActive }) =>
                  `block px-3 py-1.5 text-sm ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`
                }
              >
                {title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 flex-1 space-y-8">
        <Outlet />
      </div>
    </div>
  )
}
