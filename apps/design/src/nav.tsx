import { NavLink } from 'react-router'
import { AppHeader, buttonVariants, ThemeSelect, type Theme } from '@md-viz/ui'

/** the top nav entries: label and path. */
const NAV_LINKS = [
  { label: 'guidelines', to: '/guidelines' },
  { label: 'logo', to: '/logo' },
  { label: 'colors', to: '/colors' },
  { label: 'typography', to: '/typography' },
  { label: 'spacing', to: '/spacing' },
  { label: 'grid', to: '/grid' },
  { label: 'components', to: '/components' },
  { label: 'explorations', to: '/explorations' },
]

interface NavProps {
  themeId: string
  themes: Theme[]
  onThemeChange: (id: string) => void
}

/** the floating header: the pages of the board and the theme the pages are shown in. */
export function Nav({ themeId, themes, onThemeChange }: NavProps) {
  return (
    <AppHeader title="md-viz design" subtitle="design" className="flex-wrap">
      <nav aria-label="pages" className="flex flex-wrap items-center gap-1">
        {NAV_LINKS.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              buttonVariants({ variant: isActive ? 'default' : 'ghost', size: 'sm' })
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <ThemeSelect value={themeId} themes={themes} onChange={onThemeChange} className="w-44" />
    </AppHeader>
  )
}
