import {
  AppHeader,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Message,
} from '@md-viz/ui'
import { Section } from './section'

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
      <div className="bg-background bg-dots h-40">
        <AppHeader title="md-viz" className="static">
          <Button size="sm">action</Button>
        </AppHeader>
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
      <h3 className="text-sm font-bold">message</h3>
      <div className="flex flex-wrap items-start gap-4">
        <Message>loading notes</Message>
        <Message tone="error">could not load notes from the cache</Message>
        <Message
          tone="error"
          action={
            <a href="/" className="text-sm underline">
              back to the board
            </a>
          }
        >
          no such page
        </Message>
      </div>
      <div className="bg-background bg-dots h-32">
        <Message fill>fill centres it in its container</Message>
      </div>
    </Section>
  )
}
