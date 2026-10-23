import { Components } from './sections/Components'
import { Grid } from './sections/Grid'
import { Guidelines } from './sections/Guidelines'
import { LogoSection } from './sections/Logo'
import { NoteGridDemo } from './sections/NoteGridDemo'
import { Palette } from './sections/Palette'
import { Spacing } from './sections/Spacing'
import { Typography } from './sections/Typography'

export function Board() {
  return (
    <main className="mx-auto max-w-5xl space-y-16 p-8">
      <Guidelines />
      <LogoSection />
      <Palette />
      <Typography />
      <Spacing />
      <Grid />
      <Components />
      <NoteGridDemo />
    </main>
  )
}
