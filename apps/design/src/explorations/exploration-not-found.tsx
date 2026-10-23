import { Message } from '@md-viz/ui'

export function ExplorationNotFound() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <Message
        tone="error"
        action={
          <a href="/explorations" className="text-sm underline">
            all explorations
          </a>
        }
      >
        no such exploration
      </Message>
    </main>
  )
}
