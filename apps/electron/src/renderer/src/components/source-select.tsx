import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@md-viz/ui'
import type { Source } from '../../../shared/ipc'

const sources: Source[] = ['file', 'bear']

interface SourceSelectProps {
  value: Source
  onChange: (source: Source) => void
  disabled?: boolean
}

/** picks where the notes come from: a folder of markdown files or the Bear app. */
export function SourceSelect({ value, onChange, disabled }: SourceSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as Source)}
      {...(disabled === undefined ? {} : { disabled })}
    >
      <SelectTrigger aria-label="source">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sources.map((source) => (
          <SelectItem key={source} value={source}>
            {source}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
