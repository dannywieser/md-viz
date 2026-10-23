import { Card } from '@md-viz/ui'

export function ExplorationNotFound() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <Card className="max-w-sm gap-2 px-4 py-3">
        <p role="alert" className="text-sm">
          no such exploration
        </p>
        <a href="/explorations" className="text-sm underline">
          all explorations
        </a>
      </Card>
    </main>
  )
}
