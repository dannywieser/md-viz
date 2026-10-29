import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { ThemeSwatch } from './theme-swatch'
import { findTheme, type Theme } from '../lib/themes'

type ThemeSelectProps = {
  /** the id of the current theme. */
  value: string
  themes: Theme[]
  onChange: (id: string) => void
  /** classes for the trigger, e.g. a width. */
  className?: string
  /** shows the current theme as a pixel square instead of its name; the open list still has the names. */
  compact?: boolean
}

/** picks the theme of the whole app. */
export function ThemeSelect({ value, themes, onChange, className, compact }: ThemeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label="theme"
        title={compact ? findTheme(value).name : undefined}
        className={className}
      >
        <SelectValue>{compact ? <ThemeSwatch theme={findTheme(value)} /> : undefined}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {themes.map((theme) => (
          <SelectItem key={theme.id} value={theme.id}>
            {compact && <ThemeSwatch theme={theme} cell={4} />}
            {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
