import type { ReactNode } from 'react'
import { Button } from './button'
import { PixelIcon } from './pixel-icon'

interface ErrorStateProps {
  /** what went wrong, shown lowercased under the line of text. */
  detail?: string
  /** shows a retry button when something can be tried again. */
  onRetry?: () => void
  /** anything else to do about it, like a link, shown last. */
  action?: ReactNode
  /** replaces the line of text. */
  children?: string
}

/** something failed: a broken tile and a line of text, announced as an alert. */
function ErrorState({
  detail,
  onRetry,
  action,
  children = 'oops, we dropped a square',
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      className="flex flex-col items-center gap-4 p-6 text-center"
    >
      <PixelIcon name="broken-tile" />
      <p className="text-sm">{children.toLowerCase()}</p>
      {detail && <p className="max-w-64 text-xs text-muted-foreground">{detail.toLowerCase()}</p>}
      {onRetry && (
        <Button size="sm" onClick={onRetry}>
          try again
        </Button>
      )}
      {action}
    </div>
  )
}

export { ErrorState }
