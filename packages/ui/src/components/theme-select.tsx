import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { ThemeSwatch } from './theme-swatch'
import { findTheme, type Theme } from '../lib/themes'

type ThemeSelectProps = {
  /** the id of the current theme. */
  value: string
  themes: Theme[]
  onChange: (id: string) => void
  /** classes for the trigger. */
  className?: string
}

/** picks the theme of the whole app: a pixel square of the current theme when closed, the names when open. */
export function ThemeSelect({ value, themes, onChange, className }: ThemeSelectProps) {
  const current = findTheme(value)
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label="theme" title={current.name} className={className}>
        <SelectValue>
          <ThemeSwatch theme={current} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {themes.map((theme) => (
          <SelectItem key={theme.id} value={theme.id}>
            <ThemeSwatch theme={theme} cell={4} />
            {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
