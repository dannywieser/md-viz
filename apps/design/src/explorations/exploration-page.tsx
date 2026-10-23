import { Suspense } from 'react'
import { Message } from '@md-viz/ui'
import type { Exploration } from './types'

/** an exploration's page, shown once it has loaded. */
export function ExplorationPage({ exploration }: { exploration: Exploration }) {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <Message>loading…</Message>
        </div>
      }
    >
      <exploration.Page />
    </Suspense>
  )
}
