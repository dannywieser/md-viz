import { AppHeader, Button } from '@md-viz/ui'

/** the app header of the sync window, wordmark and its buttons; `busy` disables them like the real one. */
export function WindowHeader({ busy }: { busy: boolean }) {
  return (
    <AppHeader title="md-viz sync" subtitle="sync" className="static pl-24">
      <Button size="sm" variant="outline" disabled={busy}>
        choose folder
      </Button>
      <Button size="sm" disabled={busy}>
        sync
      </Button>
    </AppHeader>
  )
}
