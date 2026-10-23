import { Suspense } from 'react'
import type { Exploration } from './types'

/** an exploration's page, shown once it has loaded. */
export function ExplorationPage({ exploration }: { exploration: Exploration }) {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted-foreground">loading…</p>}>
      <exploration.Page />
    </Suspense>
  )
}
