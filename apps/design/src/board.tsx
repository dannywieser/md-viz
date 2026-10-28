import { Components } from './sections/components'
import { Grid } from './sections/grid'
import { Guidelines } from './sections/guidelines'
import { LogoSection } from './sections/logo'
import { NoteGridDemo } from './sections/note-grid-demo'
import { Palette } from './sections/palette'
import { Spacing } from './sections/spacing'
import { Themes } from './sections/themes'
import { Typography } from './sections/typography'

export function Board() {
  return (
    <main className="mx-auto max-w-5xl space-y-16 p-8">
      <Guidelines />
      <LogoSection />
      <Palette />
      <Themes />
      <Typography />
      <Spacing />
      <Grid />
      <Components />
      <NoteGridDemo />
    </main>
  )
}
