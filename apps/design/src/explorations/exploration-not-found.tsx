import { ErrorState, StateBlock } from '@md-viz/ui'

export function ExplorationNotFound() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <StateBlock>
        <ErrorState
          detail="no such exploration"
          action={
            <a href="/explorations" className="text-sm underline">
              all explorations
            </a>
          }
        />
      </StateBlock>
    </main>
  )
}
