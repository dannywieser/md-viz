import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@md-viz/ui'
import { DemoGroup } from './demo-group'
import { PageHeading } from './page-heading'

export function CardPage() {
  return (
    <>
      <PageHeading
        title="card"
        description="a card with the hard shadow and square edges. note grids never sit on a card; they float on the page."
      />
      <DemoGroup title="full">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>card title</CardTitle>
            <CardDescription>card description text.</CardDescription>
            <CardAction>
              <Button size="xs" variant="outline">
                edit
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>card content sits here.</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">action</Button>
          </CardFooter>
        </Card>
      </DemoGroup>
      <DemoGroup title="content only">
        <Card className="max-w-sm">
          <CardContent>
            <p>just a line of content.</p>
          </CardContent>
        </Card>
      </DemoGroup>
    </>
  )
}
