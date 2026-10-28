import type { ReactNode } from 'react'

interface AppFrameProps {
  caption: string
  width: number
  height: number
  children: ReactNode
}

/** a fixed-size mock of the app's window, on a plain background so its cards stand out; the page does not scroll. */
export function AppFrame({ caption, width, height, children }: AppFrameProps) {
  return (
    <figure className="space-y-1">
      <figcaption className="text-xs text-muted-foreground">
        {caption} · {width}×{height}
      </figcaption>
      <div className="flex flex-col overflow-hidden border bg-background" style={{ width, height }}>
        {children}
      </div>
    </figure>
  )
}
