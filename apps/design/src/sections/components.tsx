import {
  AppHeader,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Loader,
  StateBlock,
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
      <h3 className="text-sm font-bold">loader, empty state (full and compact) and error state</h3>
      <div className="bg-background bg-dots flex flex-wrap items-start gap-6 p-6">
        <StateBlock>
          <div className="p-6">
            <Loader label="loading notes" />
          </div>
        </StateBlock>
        <StateBlock>
          <EmptyState />
        </StateBlock>
        <StateBlock>
          <EmptyState compact />
        </StateBlock>
        <StateBlock>
          <ErrorState detail="could not load notes from the cache" onRetry={() => undefined} />
        </StateBlock>
      </div>
      <div className="bg-background bg-dots h-72 p-6">
        <StateBlock fill>
          <ErrorState
            action={
              <a href="/" className="text-sm underline">
                back to the board
              </a>
            }
          >
            no such page
          </ErrorState>
        </StateBlock>
      </div>
    </Section>
  )
}
