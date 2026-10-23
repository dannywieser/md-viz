import { ColorSwatch } from './color-swatch'
import { Section } from './section'

const solarized = [
  'base03',
  'base02',
  'base01',
  'base00',
  'base0',
  'base1',
  'base2',
  'base3',
  'yellow',
  'orange',
  'red',
  'magenta',
  'violet',
  'blue',
  'cyan',
  'green',
]

const roles = [
  'background',
  'foreground',
  'card',
  'popover',
  'primary',
  'secondary',
  'muted',
  'accent',
  'destructive',
  'border',
  'input',
  'ring',
]

export function Palette() {
  return (
    <Section title="color" description="solarized palette and the semantic roles mapped onto it.">
      <h3 className="text-sm font-bold">solarized</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {solarized.map((name) => (
          <ColorSwatch key={name} label={name} cssVar={`--sol-${name}`} />
        ))}
      </div>
      <h3 className="text-sm font-bold">roles</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {roles.map((name) => (
          <ColorSwatch key={name} label={name} cssVar={`--${name}`} />
        ))}
      </div>
    </Section>
  )
}
