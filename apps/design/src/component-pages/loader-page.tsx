import { Loader, loaderFills, StateBlock } from '@md-viz/ui'
import { DemoBox } from './demo-box'
import { DemoGroup } from './demo-group'
import { PageHeading } from './page-heading'

export function LoaderPage() {
  return (
    <>
      <PageHeading
        title="loader"
        description="a well filling with note-colored squares, then emptying. it has only an aria label and no text. without a fill it picks one of these at random when it mounts and keeps it."
      />
      <DemoGroup title="in a state block">
        <DemoBox>
          <StateBlock>
            <div className="p-6">
              <Loader label="loading notes" />
            </div>
          </StateBlock>
        </DemoBox>
      </DemoGroup>
      <DemoGroup title="every fill">
        <DemoBox className="flex flex-wrap gap-6">
          {loaderFills.map((fill) => (
            <figure key={fill.id} className="space-y-2">
              <StateBlock>
                <div className="p-4">
                  <Loader label={`loading ${fill.name}`} fill={fill} />
                </div>
              </StateBlock>
              <figcaption className="text-xs text-muted-foreground">{fill.name}</figcaption>
            </figure>
          ))}
        </DemoBox>
      </DemoGroup>
      <DemoGroup title="sizes">
        <DemoBox className="flex flex-wrap items-end gap-6">
          {[4, 8, 12].map((cell) => (
            <StateBlock key={cell}>
              <div className="p-4">
                <Loader label={`loading at ${cell}px`} fill={loaderFills[0]} cell={cell} />
              </div>
            </StateBlock>
          ))}
        </DemoBox>
      </DemoGroup>
    </>
  )
}
