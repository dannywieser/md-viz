import { EmptyState, ErrorState, Loader, StateBlock } from '@md-viz/ui'
import { DemoBox } from './demo-box'
import { DemoGroup } from './demo-group'
import { PageHeading } from './page-heading'

export function StateBlockPage() {
  return (
    <>
      <PageHeading
        title="state block"
        description="the block a loader, empty or error state sits in: card background and hard shadow, floating on the page like a note grid. fill centers it in its container."
      />
      <DemoGroup title="natural size">
        <DemoBox className="flex flex-wrap items-start gap-6">
          <StateBlock>
            <div className="p-6">
              <Loader label="loading notes" />
            </div>
          </StateBlock>
          <StateBlock>
            <EmptyState />
          </StateBlock>
          <StateBlock>
            <ErrorState detail="could not load notes" onRetry={() => undefined} />
          </StateBlock>
        </DemoBox>
      </DemoGroup>
      <DemoGroup title="fill">
        <DemoBox className="h-72">
          <StateBlock fill>
            <EmptyState />
          </StateBlock>
        </DemoBox>
      </DemoGroup>
    </>
  )
}
