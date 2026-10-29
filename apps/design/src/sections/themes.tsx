import { themes } from '@md-viz/ui'
import { Section } from './section'
import { ThemeRow } from './theme-row'

export function Themes() {
  return (
    <Section
      title="themes"
      description="the themes the apps can switch between. each is one fixed look for the whole ui, with 25 note colors: eight hues in three strengths and a neutral grey. the roles show in the order background, card, panel, text, muted, primary, on primary, border, focus and shadow."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {themes.map((theme) => (
          <ThemeRow key={theme.id} theme={theme} />
        ))}
      </div>
    </Section>
  )
}
