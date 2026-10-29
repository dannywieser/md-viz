import { EmptyState, StateBlock } from '@md-viz/ui'
import { DemoBox } from './demo-box'
import { DemoGroup } from './demo-group'
import { PageHeading } from './page-heading'

export function EmptyStatePage() {
  return (
    <>
      <PageHeading
        title="empty state"
        description="nothing to show yet: the palette ghost and a line of text. the compact one is a small muted ghost with no text, for blocks too small for the full state, centered in the block it fills like an empty note grid."
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
        <DemoBox className="flex justify-center">
          <div className="flex h-40 w-52 items-center justify-center bg-card shadow-hard">
            <EmptyState compact />
          </div>
        </DemoBox>
      </DemoGroup>
    </>
  )
}
