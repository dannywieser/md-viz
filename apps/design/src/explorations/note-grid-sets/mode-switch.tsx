import { Button } from '@md-viz/ui'

type ModeSwitchProps<T extends string> = {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

/** a row of buttons to pick one mode, the active one filled. */
export function ModeSwitch<T extends string>({
  label,
  options,
  value,
  onChange,
}: ModeSwitchProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      {options.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant={option.value === value ? 'default' : 'outline'}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
