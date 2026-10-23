import { PixelIcon } from './pixel-icon'

type EmptyStateProps = {
  children?: string
  /** a small, muted ghost and no text, for blocks too small for the full state. */
  compact?: boolean
}

/** nothing to show yet: a ghost and a line of text, or just a small muted ghost when `compact`. */
function EmptyState({
  children = 'the notes went out for coffee',
  compact = false,
}: EmptyStateProps) {
  if (compact) {
    return (
      <div data-slot="empty-state" data-compact="" className="p-2 opacity-50">
        <PixelIcon name="ghost" cell={4} />
      </div>
    )
  }
  return (
    <div data-slot="empty-state" className="flex flex-col items-center gap-4 p-6 text-center">
      <PixelIcon name="ghost" />
      <p className="text-sm">{children.toLowerCase()}</p>
    </div>
  )
}

export { EmptyState }
