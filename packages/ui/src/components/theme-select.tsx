import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import type { Theme } from '../lib/themes'

type ThemeSelectProps = {
  /** the id of the current theme. */
  value: string
  themes: Theme[]
  onChange: (id: string) => void
}

/** picks the theme of the whole app. */
export function ThemeSelect({ value, themes, onChange }: ThemeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label="theme">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {themes.map((theme) => (
          <SelectItem key={theme.id} value={theme.id}>
            {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
