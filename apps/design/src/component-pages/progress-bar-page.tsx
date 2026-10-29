import { ProgressBar } from '@md-viz/ui'
import { DemoGroup } from './demo-group'
import { PageHeading } from './page-heading'

const values = [0, 25, 60, 100]

export function ProgressBarPage() {
  return (
    <>
      <PageHeading
        title="progress bar"
        description="a square bar for a known total: a hard border and a flat primary fill. use the loader when the total is unknown."
      />
      <DemoGroup title="values">
        <div className="max-w-md space-y-4">
          {values.map((value) => (
            <div key={value} className="space-y-1">
              <p className="text-xs text-muted-foreground">{value} of 100</p>
              <ProgressBar value={value} max={100} label={`${value} of 100`} />
            </div>
          ))}
        </div>
      </DemoGroup>
      <DemoGroup title="no total yet">
        <div className="max-w-md">
          <ProgressBar value={0} max={0} label="nothing to do" />
        </div>
      </DemoGroup>
    </>
  )
}
