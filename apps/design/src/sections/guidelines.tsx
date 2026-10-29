import { Section } from './section'

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
    rule: 'cards are pure white in light mode and base02 in dark mode, with a hard 4px shadow (black unless the page is too dark for it, set by --shadow-color) in both and no other decoration.',
    example: 'white card · 4px black shadow',
  },
  {
    name: 'dot grid',
    rule: 'the page background is a subdued dot grid, a dot at every cell corner, so the note grid stays the focus. with several cards the one with the most notes sets the cell and the others use whole multiples of it, so cards and spacing sit on the dots. cells over 32px are divided evenly so the dots stay close.',
    example: '16px dot spacing · densest card sets the cell · set by --grid-size',
  },
  {
    name: 'floating header',
    rule: 'the app header floats on the page background, centered with an equal margin on both sides, instead of spanning the full width. it is opaque with a border and the hard shadow, and stays pinned below the top edge while the page scrolls under it.',
    example: '16px margin · border · 4px black shadow · opaque',
  },
  {
    name: 'floating note grid',
    rule: 'the note grid always floats on the page background with its own hard shadow, never on or inside a card. a label card may hang above it, exactly as wide as the grid, and an empty set shows the same block with the empty state.',
    example: 'grid block · 4px black shadow · label above · ghost when empty',
  },
  {
    name: 'loading, empty and error states',
    rule: 'a state floats on the page in its own block with the hard shadow, like the note grid. loading is a well filling with squares in the note palette, one fill picked at random per load and repeated; it has an aria label and no visible text. empty is a ghost filled with the note palette and error is a broken tile with a note-palette crack, each with a whimsical lowercase line. an error offers a retry button only when something can be retried.',
    example:
      'loader · ghost + the notes went out for coffee · broken tile + oops, we dropped a square',
  },
  {
    name: 'inputs and focus',
    rule: 'inputs have a 2px primary border and no shadow, so they sit flat beside the buttons. their popups float with a 2px black border (base3 in dark mode) and the hard shadow. keyboard focus is the same thick ring as buttons, and the border takes its color (black in solarized, the focus color of the theme otherwise, at least 3:1 against the page and the card).',
    example: 'select · 2px orange border · thick focus ring · set by --focus',
  },
  {
    name: 'themes',
    rule: 'a theme is one fixed look for the whole ui, with no light or dark mode to match: every theme sets the tokens (background, card, primary, border, focus ring, shadow) and 25 note colors. each theme keeps its focus ring at least 3:1 against the page and the card and clearly apart from the primary color, and its shadow at least 2:1 against the page. solarized light is the default.',
    example: 'solarized · gruvbox dark · nord · catppuccin · dracula · gotham · ocean',
  },
  {
    name: 'tag colors',
    rule: 'a note square takes its colors from the top level of its tags (daily/10/28 counts as daily): each top-level tag gets a palette index when it is synced and keeps it, so a tag looks the same in every app and theme. a note with several tags is striped horizontally by its first three, a note without tags is the neutral grey, and the tooltip lists all the full tags.',
    example: 'one tag · plain square · three tags · three stripes · none · grey',
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
