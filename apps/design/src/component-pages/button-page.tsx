import { Button } from '@md-viz/ui'
import { DemoGroup } from './demo-group'
import { PageHeading } from './page-heading'

const variants = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const
const sizes = ['xs', 'sm', 'default', 'lg'] as const

export function ButtonPage() {
  return (
    <>
      <PageHeading
        title="button"
        description="the shared button: six variants and four sizes. the keyboard focus ring uses the theme's focus color."
      />
      <DemoGroup title="variants and sizes">
        <div className="space-y-3">
          {variants.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-3">
              {sizes.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {variant} {size}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </DemoGroup>
      <DemoGroup title="disabled">
        <div className="flex flex-wrap items-center gap-3">
          {variants.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              {variant}
            </Button>
          ))}
        </div>
      </DemoGroup>
    </>
  )
}
