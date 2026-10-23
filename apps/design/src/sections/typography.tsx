import { Section } from './section'

const scale = [
  ['text-xs', 'text-xs'],
  ['text-sm', 'text-sm'],
  ['text-base', 'text-base'],
  ['text-lg', 'text-lg'],
  ['text-xl', 'text-xl'],
  ['text-2xl', 'text-2xl'],
  ['text-3xl', 'text-3xl'],
  ['text-4xl', 'text-4xl'],
] as const

export function Typography() {
  return (
    <Section title="typography" description="space mono, regular and bold.">
      <div className="space-y-3">
        {scale.map(([label, className]) => (
          <div key={label} className="flex items-baseline gap-4">
            <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
            <p className={className}>sphinx of black quartz, judge my vow</p>
          </div>
        ))}
      </div>
      <div className="flex gap-8">
        <p className="font-normal">regular 400</p>
        <p className="font-bold">bold 700</p>
      </div>
    </Section>
  )
}
