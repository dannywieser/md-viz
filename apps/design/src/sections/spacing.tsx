import { Section } from './section'

const steps = [
  ['1', 'w-1'],
  ['2', 'w-2'],
  ['3', 'w-3'],
  ['4', 'w-4'],
  ['6', 'w-6'],
  ['8', 'w-8'],
  ['12', 'w-12'],
  ['16', 'w-16'],
  ['24', 'w-24'],
] as const

export function Spacing() {
  return (
    <Section title="spacing" description="tailwind spacing scale (1 unit = 0.25rem).">
      <div className="space-y-2">
        {steps.map(([step, width]) => (
          <div key={step} className="flex items-center gap-4">
            <span className="w-8 shrink-0 text-xs text-muted-foreground">{step}</span>
            <div className={`h-4 rounded-sm bg-primary ${width}`} />
          </div>
        ))}
      </div>
    </Section>
  )
}
