import { Button } from '@md-viz/ui'

type GroupToggleProps = {
  grouped: boolean
  onToggle: () => void
}

/**
 * an icon button that switches the grid between grouped (by set) and not grouped (natural
 * order). the icon shows what pressing it does: four squares scattered when grouped (ungroup),
 * pulled together when not (group).
 */
export function GroupToggle({ grouped, onToggle }: GroupToggleProps) {
  const label = grouped ? 'ungroup notes' : 'group notes by set'
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      aria-pressed={grouped}
      title={label}
      onClick={onToggle}
    >
      <svg viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden>
        {grouped ? (
          <>
            <rect x="0" y="0" width="4" height="4" fill="currentColor" />
            <rect x="8" y="0" width="4" height="4" fill="currentColor" />
            <rect x="0" y="8" width="4" height="4" fill="currentColor" />
            <rect x="8" y="8" width="4" height="4" fill="currentColor" />
          </>
        ) : (
          <>
            <rect x="2" y="2" width="4" height="4" fill="currentColor" />
            <rect x="6" y="2" width="4" height="4" fill="currentColor" />
            <rect x="2" y="6" width="4" height="4" fill="currentColor" />
            <rect x="6" y="6" width="4" height="4" fill="currentColor" />
          </>
        )}
      </svg>
    </Button>
  )
}
