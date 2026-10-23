import { Section } from './Section'

const tokens = ['--grid-size', '--grid-dot']

export function Grid() {
  return (
    <Section
      title="grid"
      description="dot grid background: a dot at every cell corner. the densest card sets the cell, other cards use whole multiples of it."
    >
      <div className="flex flex-wrap items-start gap-6">
        <div className="bg-background bg-dots h-[calc(var(--grid-size)*10)] w-[calc(var(--grid-size)*10)] border" />
        <ul className="space-y-1 text-sm">
          {tokens.map((token) => (
            <li key={token}>{token}</li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
