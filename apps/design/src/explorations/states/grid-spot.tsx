import type { ReactNode } from 'react'

/** a block where a note grid would float on the page: card background, hard shadow, content centred. */
export function GridSpot({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-56 w-80 items-center justify-center bg-card shadow-hard">{children}</div>
  )
}
