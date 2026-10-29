import { EmptyState, StateBlock } from '@md-viz/ui'
import { DemoBox } from './demo-box'
import { DemoGroup } from './demo-group'
import { PageHeading } from './page-heading'

export function EmptyStatePage() {
  return (
    <>
      <PageHeading
        title="empty state"
        description="nothing to show yet: the palette ghost and a line of text. the compact one is a small muted ghost with no text, for blocks too small for the full state."
      />
      <DemoGroup title="default text">
        <DemoBox>
          <StateBlock>
            <EmptyState />
          </StateBlock>
        </DemoBox>
      </DemoGroup>
      <DemoGroup title="custom text">
        <DemoBox>
          <StateBlock>
            <EmptyState>no notes in this set</EmptyState>
          </StateBlock>
        </DemoBox>
      </DemoGroup>
      <DemoGroup title="compact">
        <DemoBox>
          <StateBlock>
            <EmptyState compact />
          </StateBlock>
        </DemoBox>
      </DemoGroup>
    </>
  )
}
