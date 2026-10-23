import type { ReactNode } from 'react'
import { cn } from 'cn'
import { Card } from './card'

interface MessageProps {
  /** `error` is announced as an alert and drawn in the destructive color. */
  tone?: 'muted' | 'error'
  /** centre the message in its container, which it fills. */
  fill?: boolean
  /** something to do about it, like a link, shown under the text. */
  action?: ReactNode
  /** shown lowercased, whatever its source. */
  children: string
}

/** a short line of text on a card: a loading note, an empty state or an error. */
function Message({ tone = 'muted', fill = false, action, children }: MessageProps) {
  const card = (
    <Card className="gap-2 px-4 py-3">
      <p
        role={tone === 'error' ? 'alert' : undefined}
        className={cn('text-sm', tone === 'error' ? 'text-destructive' : 'text-muted-foreground')}
      >
        {children.toLowerCase()}
      </p>
      {action}
    </Card>
  )
  return fill ? <div className="flex h-full items-center justify-center">{card}</div> : card
}

export { Message }
