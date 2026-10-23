import { PixelIcon } from './pixel-icon'

/** nothing to show yet: a ghost and a line of text. */
function EmptyState({ children = 'the notes went out for coffee' }: { children?: string }) {
  return (
    <div data-slot="empty-state" className="flex flex-col items-center gap-4 p-6 text-center">
      <PixelIcon name="ghost" />
      <p className="text-sm">{children.toLowerCase()}</p>
    </div>
  )
}

export { EmptyState }
