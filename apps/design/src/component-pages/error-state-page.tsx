import { Link } from 'react-router'
import { ErrorState, StateBlock } from '@md-viz/ui'
import { DemoBox } from './demo-box'
import { DemoGroup } from './demo-group'
import { PageHeading } from './page-heading'

export function ErrorStatePage() {
  return (
    <>
      <PageHeading
        title="error state"
        description="something failed: the broken tile and a line of text, announced as an alert. pass a retry handler only when trying again is possible; action is for anything else, like a link."
      />
      <DemoGroup title="default">
        <DemoBox>
          <StateBlock>
            <ErrorState />
          </StateBlock>
        </DemoBox>
      </DemoGroup>
      <DemoGroup title="with detail and retry">
        <DemoBox>
          <StateBlock>
            <ErrorState detail="could not load notes from the cache" onRetry={() => undefined} />
          </StateBlock>
        </DemoBox>
      </DemoGroup>
      <DemoGroup title="with a custom line and an action">
        <DemoBox>
          <StateBlock>
            <ErrorState
              action={
                <Link to="/components" className="text-sm underline">
                  all components
                </Link>
              }
            >
              no such page
            </ErrorState>
          </StateBlock>
        </DemoBox>
      </DemoGroup>
    </>
  )
}
