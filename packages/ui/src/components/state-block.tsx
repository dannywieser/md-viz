import type { ReactNode } from 'react'

/** the block a loader, empty or error state sits in: card background and hard shadow, floating on the page. */
function StateBlock({ fill = false, children }: { fill?: boolean; children: ReactNode }) {
  const block = (
    <div data-slot="state-block" className="bg-card shadow-hard">
      {children}
    </div>
  )
  return fill ? <div className="flex h-full items-center justify-center">{block}</div> : block
}

export { StateBlock }
