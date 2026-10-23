import {
  AppHeader,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@md-viz/ui'
import { Section } from './Section'

const variants = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const
const sizes = ['xs', 'sm', 'default', 'lg'] as const

export function Components() {
  return (
    <Section title="components" description="shared components from @md-viz/ui.">
      <h3 className="text-sm font-bold">button variants</h3>
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
      <h3 className="text-sm font-bold">button sizes</h3>
      <div className="flex flex-wrap items-center gap-3">
        {sizes.map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
        <Button disabled>disabled</Button>
      </div>
      <h3 className="text-sm font-bold">app header</h3>
      <div className="border">
        <AppHeader title="md-viz" className="static">
          <Button size="sm">action</Button>
        </AppHeader>
        <div className="bg-background bg-dots h-24" />
      </div>
      <h3 className="text-sm font-bold">card</h3>
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>card title</CardTitle>
          <CardDescription>card description text.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>card content sits here.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">action</Button>
        </CardFooter>
      </Card>
    </Section>
  )
}
