import { Section } from './Section'

const guidelines = [
  {
    name: 'lowercase text only',
    rule: 'all interface text is lowercase: headings, labels, buttons, descriptions and sample content. no title case, no sentence case, no all caps.',
    example: 'save note · open folder · 12 notes',
  },
  {
    name: 'square edges',
    rule: 'no rounded corners on any component. every radius token resolves to zero, so new components inherit square edges automatically.',
    example: 'buttons, cards, inputs, badges: all square',
  },
  {
    name: 'cards',
    rule: 'cards are pure white in light mode and base02 in dark mode, with a hard 4px black shadow in both and no other decoration.',
    example: 'white card · 4px black shadow',
  },
  {
    name: 'dot grid',
    rule: 'the page background is a subdued dot grid, a dot at every cell corner, so the note grid stays the focus. with several cards the one with the most notes sets the cell and the others use whole multiples of it, so cards and spacing sit on the dots. cells over 32px are divided evenly so the dots stay close.',
    example: '16px dot spacing · densest card sets the cell · set by --grid-size',
  },
  {
    name: 'pixel logo',
    rule: 'the logo is pixel art from 5 wide bitmap glyphs: no smoothing, no rounding. the dot of the mark and the viz of the wordmark use the primary color, the rest the text color; the wordmark draws each cell as a 2x2 block of small squares. the favicon is a static copy with fixed solarized colors, so update it by hand with the theme.',
    example: '.md · md-viz',
  },
]

export function Guidelines() {
  return (
    <Section
      title="guidelines"
      description="design intentions for the theme. each guideline is also enforced by a test where it can be."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {guidelines.map(({ name, rule, example }) => (
          <div key={name} className="space-y-2 border bg-muted p-4">
            <h3 className="text-sm font-bold">{name}</h3>
            <p className="text-sm text-muted-foreground">{rule}</p>
            <p className="bg-card px-3 py-2 text-sm">{example}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
