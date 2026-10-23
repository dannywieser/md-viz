import type { ReactNode } from 'react'

/** a captioned area of the page, which already has the dot grid, so a state shows the way it sits in an app. */
export function StateFrame({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="space-y-1">
      <figcaption className="text-xs text-muted-foreground">{caption}</figcaption>
      <div className="flex min-h-72 items-center justify-center border p-6">{children}</div>
    </figure>
  )
}
