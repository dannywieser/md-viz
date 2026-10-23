import type { ReactNode } from 'react'
import type { NotePalette } from './icon-options'
import { PixelArt } from './pixel-art'

/** an icon over a line of text, with an optional action under it. */
export function StateBody({
  rows,
  accent,
  notePalette,
  text,
  action,
}: {
  rows: readonly string[]
  accent?: string
  notePalette?: NotePalette
  text: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <PixelArt rows={rows} accent={accent} notePalette={notePalette} />
      <p className="text-sm">{text}</p>
      {action}
    </div>
  )
}
