import { AppHeader, Button } from '@md-viz/ui'
import { DemoBox } from './demo-box'
import { DemoGroup } from './demo-group'
import { PageHeading } from './page-heading'

export function AppHeaderPage() {
  return (
    <>
      <PageHeading
        title="app header"
        description="the floating header: the wordmark on a card with a margin, border and hard shadow, pinned below the top edge. the demos make it static so it stays in its box."
      />
      <DemoGroup title="with actions">
        <DemoBox className="h-40">
          <AppHeader title="md-viz" className="static mx-0 mt-0">
            <Button size="sm" variant="outline">
              action
            </Button>
            <Button size="sm">save</Button>
          </AppHeader>
        </DemoBox>
      </DemoGroup>
      <DemoGroup title="with a subtitle">
        <DemoBox className="h-40">
          <AppHeader title="md-viz" subtitle="design" className="static mx-0 mt-0" />
        </DemoBox>
      </DemoGroup>
    </>
  )
}
