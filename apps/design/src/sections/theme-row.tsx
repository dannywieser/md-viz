import { noteColors, type Theme } from '@md-viz/ui'

/** the ui roles of a theme, in the order the row shows them. */
const ROLES = [
  'background',
  'card',
  'panel',
  'text',
  'muted',
  'primary',
  'onPrimary',
  'border',
  'focus',
  'shadow',
] as const

/** one theme: its ui roles and its note colors, as swatches that do not depend on the board's own theme. */
export function ThemeRow({ theme }: { theme: Theme }) {
  return (
    <div className="space-y-2 border bg-muted p-4" aria-label={theme.name} role="group">
      <h3 className="text-sm font-bold">{theme.name}</h3>
      <ul className="flex flex-wrap gap-1" aria-label="ui roles">
        {ROLES.map((role) => (
          <li
            key={role}
            title={`${role} ${theme.ui[role]}`}
            className="size-8 border border-border"
            style={{ background: theme.ui[role] }}
          />
        ))}
      </ul>
      <ol className="flex flex-wrap gap-0.5" aria-label="note colors">
        {noteColors(theme).map((color, index) => (
          <li key={index} title={`${index}`} className="size-4" style={{ background: color }} />
        ))}
      </ol>
    </div>
  )
}
