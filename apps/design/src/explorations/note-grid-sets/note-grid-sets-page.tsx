import { IterationSection } from './iteration-section'
import { iterations } from './iterations'

export function NoteGridSets() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl space-y-8 p-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">note grid sets</h1>
          <p className="text-sm text-muted-foreground">
            one grid as the foundation of the apps, with switchable modes: sets drawn as blocks
            sized by their notes (kept on the background dots), the same sets as groups of
            individual squares, and squares coloured by set or by tag. sample data only, with
            generic sets; the live note grid is untouched. iterations are kept, newest first.
          </p>
        </header>
        {iterations.map((iteration) => (
          <IterationSection
            key={iteration.number}
            number={iteration.number}
            title={iteration.title}
            date={iteration.date}
          >
            <iteration.Component />
          </IterationSection>
        ))}
      </main>
    </div>
  )
}
